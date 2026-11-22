import {db,currentUser,sameOrigin,hash} from "../_auth.js";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const secret=(env,k)=>typeof env?.[k]==="string"?env[k].trim():"";
function decode(value){const s=value.replace(/-/g,"+").replace(/_/g,"/"),p=s+"=".repeat((4-s.length%4)%4);return Uint8Array.from(atob(p),c=>c.charCodeAt(0))}
function encode(bytes){let s="";for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)}
async function cryptoKey(text,usage){const raw=decode(text);if(raw.length!==32)throw new Error("Invalid connector key.");return crypto.subtle.importKey("raw",raw,{name:"AES-GCM"},false,[usage])}
async function decrypt(value,keyText){const packed=decode(value),iv=packed.slice(0,12),cipher=packed.slice(12),key=await cryptoKey(keyText,"decrypt");const clear=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,cipher);return new TextDecoder().decode(clear)}
async function encrypt(value,keyText){const key=await cryptoKey(keyText,"encrypt"),iv=crypto.getRandomValues(new Uint8Array(12)),cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,new TextEncoder().encode(value));const packed=new Uint8Array(12+cipher.byteLength);packed.set(iv);packed.set(new Uint8Array(cipher),12);return encode(packed)}
async function providerJson(url,options){const r=await fetch(url,options);const raw=await r.text();let data={};try{data=JSON.parse(raw)}catch{}if(!r.ok)throw new Error(r.status===401?"The provider token was rejected. Reconnect this account.":"The connected provider request failed.");return data}
async function accessToken(row,env,d){
 const key=secret(env,"JT_CONNECTOR_ENCRYPTION_KEY");if(!key)throw new Error("Connector encryption is not configured.");
 if(!row.encrypted_access_token)throw new Error("This connector has no active access token.");
 if(!row.token_expires_at||row.token_expires_at>Date.now()/1000+60)return decrypt(row.encrypted_access_token,key);
 if(!row.encrypted_refresh_token)throw new Error("The access token expired. Disconnect and reconnect this account.");
 const refresh=await decrypt(row.encrypted_refresh_token,key);
 const data=await providerJson("https://oauth2.googleapis.com/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:secret(env,"GOOGLE_CLIENT_ID"),client_secret:secret(env,"GOOGLE_CLIENT_SECRET"),refresh_token:refresh,grant_type:"refresh_token"})});
 const encrypted=await encrypt(data.access_token,key),expires=Math.floor(Date.now()/1000)+Number(data.expires_in||3600);
 await d.prepare("UPDATE connector_accounts SET encrypted_access_token=?,token_expires_at=?,updated_at=? WHERE id=?").bind(encrypted,expires,Math.floor(Date.now()/1000),row.id).run();
 return data.access_token;
}
export async function onRequestPost({request,env}){
 if(!sameOrigin(request))return json({error:"Origin not allowed."},403);
 const d=db(env);if(!d)return json({error:"JT account storage is unavailable."},503);
 const user=await currentUser(request,env);if(!user)return json({error:"Sign in to JT Account first."},401);
 let body;try{body=await request.json()}catch{return json({error:"Invalid JSON."},400)}
 const action=typeof body?.action==="string"?body.action:"",query=typeof body?.query==="string"?body.query.trim().slice(0,300):"";
 const spec={"github.repositories":{provider:"github"},"drive.search":{provider:"google-drive"},"gmail.search":{provider:"gmail"}}[action];
 if(!spec)return json({error:"Unsupported connector action."},400);
 if(action!=="github.repositories"&&!query)return json({error:"A search query is required."},400);
 const row=await d.prepare("SELECT * FROM connector_accounts WHERE user_id=? AND provider=? AND status='connected' ORDER BY updated_at DESC LIMIT 1").bind(user.id,spec.provider).first();
 if(!row)return json({error:"Connect "+spec.provider+" in the Connectors Hub first."},409);
 try{
  const token=await accessToken(row,env,d);let result;
  if(action==="github.repositories"){
   const data=await providerJson("https://api.github.com/user/repos?sort=updated&per_page=30&visibility=public",{headers:{authorization:"Bearer "+token,accept:"application/vnd.github+json","user-agent":"Jeff-AI-JT-Connectors"}});
   result=(Array.isArray(data)?data:[]).map(x=>({name:x.full_name,description:x.description||"",url:x.html_url,private:Boolean(x.private),updated_at:x.updated_at,default_branch:x.default_branch}));
  }else if(action==="drive.search"){
   const q="name contains '"+query.replace(/\\/g,"\\\\").replace(/'/g,"\\'")+"' and trashed = false";
   const params=new URLSearchParams({q, pageSize:"20",orderBy:"modifiedTime desc",fields:"files(id,name,mimeType,modifiedTime,webViewLink,size)"});
   const data=await providerJson("https://www.googleapis.com/drive/v3/files?"+params,{headers:{authorization:"Bearer "+token}});
   result=(data.files||[]).map(x=>({id:x.id,name:x.name,mimeType:x.mimeType,modifiedTime:x.modifiedTime,url:x.webViewLink,size:x.size}));
  }else{
   const params=new URLSearchParams({q:query,maxResults:"20"});
   const data=await providerJson("https://gmail.googleapis.com/gmail/v1/users/me/messages?"+params,{headers:{authorization:"Bearer "+token}});
   const messages=Array.isArray(data.messages)?data.messages:[];
   result=await Promise.all(messages.slice(0,20).map(async item=>{
    const msg=await providerJson("https://gmail.googleapis.com/gmail/v1/users/me/messages/"+encodeURIComponent(item.id)+"?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date",{headers:{authorization:"Bearer "+token}});
    const headers=msg.payload?.headers||[],get=name=>headers.find(h=>h.name?.toLowerCase()===name.toLowerCase())?.value||"";
    return {id:msg.id,threadId:msg.threadId,snippet:msg.snippet||"",from:get("From"),subject:get("Subject"),date:get("Date")};
   }));
  }
  const now=Math.floor(Date.now()/1000);
  await d.prepare("INSERT INTO connector_audit_events (user_id,connector_account_id,action,outcome,details_json,created_at) VALUES (?,?,?,?,?,?)").bind(user.id,row.id,"connector.tool."+action,"success",JSON.stringify({resultCount:result.length}),now).run();
  return json({ok:true,action,count:result.length,results:result});
 }catch(error){
  const now=Math.floor(Date.now()/1000);
  await d.prepare("INSERT INTO connector_audit_events (user_id,connector_account_id,action,outcome,details_json,created_at) VALUES (?,?,?,?,?,?)").bind(user.id,row.id,"connector.tool."+action,"error",JSON.stringify({reason:String(error?.message||"provider_error").slice(0,160)}),now).run().catch(()=>{});
  return json({error:String(error?.message||"Connector request failed.")},502);
 }
}