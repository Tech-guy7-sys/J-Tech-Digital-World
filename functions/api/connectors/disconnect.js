import {db,currentUser,sameOrigin} from "../_auth.js";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
export async function onRequestPost({request,env}){
 if(!sameOrigin(request))return json({error:"Origin not allowed."},403);
 const d=db(env);if(!d)return json({error:"JT_AUTH_DB is not configured."},503);
 const user=await currentUser(request,env);if(!user)return json({error:"Sign in first."},401);
 let body;try{body=await request.json()}catch{return json({error:"Invalid JSON."},400)}
 const id=typeof body?.id==="string"?body.id:"";if(!id)return json({error:"Connection ID required."},400);
 const row=await d.prepare("SELECT provider FROM connector_accounts WHERE id=? AND user_id=?").bind(id,user.id).first();if(!row)return json({error:"Connection not found."},404);
 await d.prepare("UPDATE connector_accounts SET status='revoked',encrypted_access_token=NULL,encrypted_refresh_token=NULL,updated_at=? WHERE id=? AND user_id=?").bind(Math.floor(Date.now()/1000),id,user.id).run();
 await d.prepare("INSERT INTO connector_audit_events (user_id,connector_account_id,action,outcome,details_json,created_at) VALUES (?,?,?,?,?,?)").bind(user.id,id,"connector.disconnect","success",JSON.stringify({provider:row.provider}),Math.floor(Date.now()/1000)).run();
 return json({ok:true});
}