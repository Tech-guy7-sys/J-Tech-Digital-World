import {db,currentUser,randomToken,hash} from "../_auth.js";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const providers={
 github:{client:"GITHUB_CLIENT_ID",authorize:"https://github.com/login/oauth/authorize",scope:"read:user user:email"},
 "google-drive":{client:"GOOGLE_CLIENT_ID",authorize:"https://accounts.google.com/o/oauth2/v2/auth",scope:"openid email profile https://www.googleapis.com/auth/drive.readonly",extra:{access_type:"offline",prompt:"consent"}},
 gmail:{client:"GOOGLE_CLIENT_ID",authorize:"https://accounts.google.com/o/oauth2/v2/auth",scope:"openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose",extra:{access_type:"offline",prompt:"consent"}}
};
export async function onRequestGet({request,env}){
 const d=db(env);if(!d)return json({error:"JT_AUTH_DB is not configured."},503);
 const user=await currentUser(request,env);if(!user)return json({error:"Sign in to your JT account before connecting a service."},401);
 const url=new URL(request.url),provider=(url.searchParams.get("provider")||"").toLowerCase(),cfg=providers[provider];
 if(!cfg)return json({error:"Unsupported connector."},400);
 if(!env?.[cfg.client]||!env?.[cfg.client.replace("_ID","_SECRET")])return json({error:"The provider OAuth app is not configured as Cloudflare Pages secrets."},503);
 const state=randomToken(),stateHash=await hash(state),now=Math.floor(Date.now()/1000);
 await d.prepare("DELETE FROM connector_oauth_states WHERE expires_at < ?").bind(now).run();
 await d.prepare("INSERT INTO connector_oauth_states (state_hash,user_id,provider,expires_at,created_at) VALUES (?,?,?,?,?)").bind(stateHash,user.id,provider,now+600,now).run();
 const callback=new URL("/api/connectors/callback",url.origin).toString();
 const auth=new URL(cfg.authorize);auth.searchParams.set("client_id",env[cfg.client]);auth.searchParams.set("redirect_uri",callback);auth.searchParams.set("response_type","code");auth.searchParams.set("scope",cfg.scope);auth.searchParams.set("state",state);
 for(const [k,v] of Object.entries(cfg.extra||{}))auth.searchParams.set(k,v);
 return Response.redirect(auth.toString(),302);
}