import {db,hash,randomToken} from "../_auth.js";
const go=(url)=>Response.redirect(url,302);
const secret=(env,k)=>typeof env?.[k]==="string"?env[k].trim():"";
async function encrypt(value,keyText){
 if(!keyText)throw new Error("JT_CONNECTOR_ENCRYPTION_KEY is not configured.");
 const raw=Uint8Array.from(atob(keyText.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));
 if(raw.length!==32)throw new Error("JT_CONNECTOR_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
 const key=await crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt"]);
 const iv=crypto.getRandomValues(new Uint8Array(12)),data=new TextEncoder().encode(value);
 const cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,data);
 return btoa(String.fromCharCode(...iv,...new Uint8Array(cipher)));
}
async function fetchJson(url,options){const r=await fetch(url,options);const t=await r.text();let j={};try{j=JSON.parse(t)}catch{}if(!r.ok)throw new Error("OAuth provider rejected the connection.");return j}
export async function onRequestGet({request,env}){
 const d=db(env),url=new URL(request.url),origin=url.origin;
 if(!d)return go(origin+"/integrations.html?connection=database_missing");
 const code=url.searchParams.get("code"),state=url.searchParams.get("state"),provider=(url.searchParams.get("provider")||"").toLowerCase();
 if(url.searchParams.has("error"))return go(origin+"/integrations.html?connection=cancelled");
 if(!code||!state)return go(origin+"/integrations.html?connection=invalid");
 const stateHash=await hash(state),now=Math.floor(Date.now()/1000);
 const saved=await d.prepare("SELECT user_id,provider,expires_at FROM connector_oauth_states WHERE state_hash=? LIMIT 1").bind(stateHash).first();
 await d.prepare("DELETE FROM connector_oauth_states WHERE state_hash=?").bind(stateHash).run();
 if(!saved||saved.expires_at<now)return go(origin+"/integrations.html?connection=expired");
 const p=saved.provider;if(provider&&provider!==p)return go(origin+"/integrations.html?connection=invalid");
 const callback=origin+"/api/connectors/callback";let tokenData={},profile={},scopes="";
 try{
  if(p==="github"){
   tokenData=await fetchJson("https://github.com/login/oauth/access_token",{method:"POST",headers:{"accept":"application/json","content-type":"application/json"},body:JSON.stringify({client_id:secret(env,"GITHUB_CLIENT_ID"),client_secret:secret(env,"GITHUB_CLIENT_SECRET"),code,redirect_uri:callback})});
   if(!tokenData.access_token)throw new Error("No access token.");
   profile=await fetchJson("https://api.github.com/user",{headers:{authorization:"Bearer "+tokenData.access_token,accept:"application/vnd.github+json","user-agent":"Jeff-AI-JT-Connectors"}});
   scopes=tokenData.scope||"read:user user:email repo";
  }else if(p==="google"){
   tokenData=await fetchJson("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:secret(env,"GOOGLE_CLIENT_ID"),client_secret:secret(env,"GOOGLE_CLIENT_SECRET"),code,grant_type:"authorization_code",redirect_uri:callback})});
   if(!tokenData.access_token)throw new Error("No access token.");
   profile=await fetchJson("https://openidconnect.googleapis.com/v1/userinfo",{headers:{authorization:"Bearer "+tokenData.access_token}});
   scopes=tokenData.scope||"openid email profile drive.readonly";
  }else return go(origin+"/integrations.html?connection=unsupported");
  const encrypted=await encrypt(tokenData.access_token,secret(env,"JT_CONNECTOR_ENCRYPTION_KEY"));
  const encryptedRefresh=tokenData.refresh_token?await encrypt(tokenData.refresh_token,secret(env,"JT_CONNECTOR_ENCRYPTION_KEY")):null;
  const id=crypto.randomUUID(),stamp=now,accountId=String(profile.id||profile.sub||profile.login||profile.email||"unknown"),display=String(profile.name||profile.login||profile.email||"Connected account").slice(0,160);
  await d.prepare("INSERT INTO connector_accounts (id,user_id,provider,provider_account_id,display_name,status,granted_scopes,encrypted_access_token,encrypted_refresh_token,token_expires_at,created_at,updated_at) VALUES (?,?,?,?,?,'connected',?,?,?,?,?,?) ON CONFLICT(user_id,provider,provider_account_id) DO UPDATE SET display_name=excluded.display_name,status='connected',granted_scopes=excluded.granted_scopes,encrypted_access_token=excluded.encrypted_access_token,encrypted_refresh_token=excluded.encrypted_refresh_token,token_expires_at=excluded.token_expires_at,updated_at=excluded.updated_at")
   .bind(id,saved.user_id,p,accountId,display,scopes,encrypted,encryptedRefresh,tokenData.expires_in?stamp+Number(tokenData.expires_in):null,stamp,stamp).run();
  await d.prepare("INSERT INTO connector_audit_events (user_id,action,outcome,details_json,created_at) VALUES (?,?,?,?,?)").bind(saved.user_id,"connector.oauth.connect","success",JSON.stringify({provider:p,account:display}),stamp).run();
  return go(origin+"/integrations.html?connection=success&provider="+encodeURIComponent(p));
 }catch(e){
  await d.prepare("INSERT INTO connector_audit_events (user_id,action,outcome,details_json,created_at) VALUES (?,?,?,?,?)").bind(saved.user_id,"connector.oauth.connect","error",JSON.stringify({provider:p,reason:String(e.message||"connection_failed").slice(0,180)}),now).run().catch(()=>{});
  return go(origin+"/integrations.html?connection=error&provider="+encodeURIComponent(p));
 }
}