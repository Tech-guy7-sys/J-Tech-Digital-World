import {db,currentUser} from "../_auth.js";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
export async function onRequestGet({request,env}){
 const d=db(env);if(!d)return json({error:"JT_AUTH_DB is not configured."},503);
 const user=await currentUser(request,env);if(!user)return json({error:"Sign in to view your connected services."},401);
 const rows=await d.prepare("SELECT id,provider,provider_account_id,display_name,status,granted_scopes,token_expires_at,created_at,updated_at FROM connector_accounts WHERE user_id=? ORDER BY updated_at DESC").bind(user.id).all();
 return json({connections:rows.results||[]});
}