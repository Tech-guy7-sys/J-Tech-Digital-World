import {db,hash} from "../_auth.js";
const go=url=>Response.redirect(url,302);
const secret=(env,k)=>typeof env?.[k]==="string"?env[k].trim():"";
function keyBytes(text){const normalized=text.replace(/-/g,"+").replace(/_/g,"/");const padded=normalized+"=".repeat((4-normalized.length%4)%4);return Uint8Array.from(atob(padded),c=>c.charCodeAt(0))}
async function encrypt(value,keyText){
 if(!keyText)throw new Error("Connector encryption is not configured.");
 const raw=keyBytes(keyText);if(raw.length!==32)throw new Error("Invalid connector encryption key.");
 const key=await crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,["encrypt"]);
 const iv=crypto.getRandomValues(new Uint8Array(12)),cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(value));
 const packed=new Uint8Array(iv.length+cipher.byteLength);packed.set(iv);packed.set(new Uint8Array(cipher),iv.length);
 let binary="";for(const b of packed)binary+=String.fromCharCode(b);return btoa(binary);
}
async function fetchJson(url,options){const r=await fetch(url,options);const raw=await r.text();let data={};try{data=JSON.parse(raw)}catch{}if(!r.ok)throw new Error("Provider token exchange or profile request failed.");return data}
export async function onRequestGet({request,env}){
 const d=db(env),url=new URL(request.url),origin=url.origin;
 if(!d)return go(origin+"/integrations.html?connection=database_missing");
 if(url.searchParams.has("error"))return go(origin+"/integrations.html?connection=cancelled");
 const code=url.searchParams.get("code"),state=url.searchParams.get("state");
 if(!code||!state)return go(origin+"/integrations.html?connection=invalid");
 const stateHash=await hash(state),now=Math.floor(Date.now()/1000);
 const saved=await d.prepare("SELECT user_id,provider,expires_at FROM connector_oauth_states WHERE state_hash=? LIMIT 1").bind(stateHash).first();
 await d.prepare("DELETE FROM connector_oauth_states WHERE state_hash=?").bind(stateHash).run();
 if(!saved||saved.expires_at<now)return go(origin+"/integrations.html?connection=expired");
 const provider=saved.provider,callback=origin+"/api/connectors/callback";
 try{
  let tokenData={},profile={},scopes="";
  if(provider==="github"){
   tokenData=await fetchJson("https://github.com/login/oauth/access_token",{method:"POST",headers:{"accept":"application/json","content-type":"application/json"},body:JSON.stringify({client_id:secret(env,"GITHUB_CLIENT_ID"),client_secret:secret(env,"GITHUB_CLIENT_SECRET"),code,redirect_uri:callback})});
   if(!tokenData.access_token)throw new Error("No access token.");
   profile=await fetchJson("https://api.github.com/user",{headers:{authorization:"Bearer "+tokenData.access_token,accept:"application/vnd.github+json","user-agent":"Jeff-AI-JT-Connectors"}});
   scopes=tokenData.scope||"read:user user:email";
  }else if(provider==="google-drive"||provider==="gmail"||provider==="google-calendar"){
   tokenData=await fetchJson("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:secret(env,"GOOGLE_CLIENT_ID"),client_secret:secret(env,"GOOGLE_CLIENT_SECRET"),code,grant_type:"authorization_code",redirect_uri:callback})});
   if(!tokenData.access_token)throw new Error("No access token.");
   profile=await fetchJson("https://openidconnect.googleapis.com/v1/userinfo",{headers:{authorization:"Bearer "+tokenData.access_token}});
   if(!profile.sub)throw new Error("Google did not return a stable account identifier.");
   scopes=tokenData.scope||(provider==="gmail"?"gmail.readonly":provider==="google-calendar"?"calendar.events.readonly":provider==="notion"?"workspace search":provider==="slack"?"search:read,users:read":provider==="dropbox"?"files.metadata.read":provider==="onedrive"?"User.Read Files.Read offline_access":"drive.readonly");
  }else if(provider==="notion"){
   tokenData=await fetchJson("https://api.notion.com/v1/oauth/token",{method:"POST",headers:{"authorization":"Basic "+btoa(secret(env,"NOTION_CLIENT_ID")+":"+secret(env,"NOTION_CLIENT_SECRET")),"content-type":"application/json"},body:JSON.stringify({grant_type:"authorization_code",code,redirect_uri:callback})});
   if(!tokenData.access_token)throw new Error("No Notion access token.");
   profile={id:tokenData.workspace_id||tokenData.owner?.user?.id||"notion-workspace",name:tokenData.workspace_name||tokenData.owner?.user?.name||"Notion workspace"};scopes="workspace search";
  }else if(provider==="slack"){
   tokenData=await fetchJson("https://slack.com/api/oauth.v2.access",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:secret(env,"SLACK_CLIENT_ID"),client_secret:secret(env,"SLACK_CLIENT_SECRET"),code,redirect_uri:callback})});
   const userToken=tokenData.authed_user?.access_token;if(!tokenData.ok||!userToken)throw new Error("Slack did not return a user token. Check user-scope configuration.");
   tokenData.access_token=userToken;tokenData.refresh_token=tokenData.authed_user.refresh_token||null;tokenData.expires_in=tokenData.authed_user.expires_in||null;profile={id:tokenData.authed_user.id||tokenData.team?.id,name:tokenData.team?.name||"Slack workspace"};scopes=tokenData.authed_user?.scope||"search:read,users:read";
  }else if(provider==="dropbox"){
   tokenData=await fetchJson("https://api.dropboxapi.com/oauth2/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:secret(env,"DROPBOX_CLIENT_ID"),client_secret:secret(env,"DROPBOX_CLIENT_SECRET"),code,grant_type:"authorization_code",redirect_uri:callback})});
   if(!tokenData.access_token)throw new Error("No Dropbox access token.");
   profile=await fetchJson("https://api.dropboxapi.com/2/users/get_current_account",{method:"POST",headers:{authorization:"Bearer "+tokenData.access_token}});profile.id=profile.account_id;profile.name=profile.name?.display_name||"Dropbox account";scopes="files.metadata.read";
  }else if(provider==="onedrive"){
   tokenData=await fetchJson("https://login.microsoftonline.com/common/oauth2/v2.0/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:secret(env,"MICROSOFT_CLIENT_ID"),client_secret:secret(env,"MICROSOFT_CLIENT_SECRET"),code,grant_type:"authorization_code",redirect_uri:callback,scope:"User.Read Files.Read offline_access"})});
   if(!tokenData.access_token)throw new Error("No Microsoft access token.");
   profile=await fetchJson("https://graph.microsoft.com/v1.0/me?$select=id,displayName,userPrincipalName",{headers:{authorization:"Bearer "+tokenData.access_token}});scopes=tokenData.scope||"User.Read Files.Read offline_access";
  }else return go(origin+"/integrations.html?connection=unsupported");
  const encrypted=await encrypt(tokenData.access_token,secret(env,"JT_CONNECTOR_ENCRYPTION_KEY"));
  const encryptedRefresh=tokenData.refresh_token?await encrypt(tokenData.refresh_token,secret(env,"JT_CONNECTOR_ENCRYPTION_KEY")):null;
  const accountId=String(profile.id||profile.sub||"unknown"),display=String(profile.login||profile.name||profile.email||"Connected account").slice(0,160);
  const id=crypto.randomUUID();
  await d.prepare("INSERT INTO connector_accounts (id,user_id,provider,provider_account_id,display_name,status,granted_scopes,encrypted_access_token,encrypted_refresh_token,token_expires_at,created_at,updated_at) VALUES (?,?,?,?,?,'connected',?,?,?,?,?,?) ON CONFLICT(user_id,provider,provider_account_id) DO UPDATE SET display_name=excluded.display_name,status='connected',granted_scopes=excluded.granted_scopes,encrypted_access_token=excluded.encrypted_access_token,encrypted_refresh_token=COALESCE(excluded.encrypted_refresh_token,connector_accounts.encrypted_refresh_token),token_expires_at=excluded.token_expires_at,updated_at=excluded.updated_at")
   .bind(id,saved.user_id,provider,accountId,display,scopes,encrypted,encryptedRefresh,tokenData.expires_in?now+Number(tokenData.expires_in):null,now,now).run();
  await d.prepare("INSERT INTO connector_audit_events (user_id,action,outcome,details_json,created_at) VALUES (?,?,?,?,?)").bind(saved.user_id,"connector.oauth.connect","success",JSON.stringify({provider,account:display}),now).run();
  return go(origin+"/integrations.html?connection=success&provider="+encodeURIComponent(provider));
 }catch(error){
  await d.prepare("INSERT INTO connector_audit_events (user_id,action,outcome,details_json,created_at) VALUES (?,?,?,?,?)").bind(saved.user_id,"connector.oauth.connect","error",JSON.stringify({provider,reason:String(error?.message||"connection_failed").slice(0,180)}),now).run().catch(()=>{});
  return go(origin+"/integrations.html?connection=error&provider="+encodeURIComponent(provider));
 }
}