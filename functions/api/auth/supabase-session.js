import {db,reply,sameOrigin,randomToken,createSession,cookieHeader} from "../_auth.js";

export async function onRequestPost({request,env}) {
  if(!sameOrigin(request)) return reply({error:"Origin not allowed."},403);
  const d=db(env);
  if(!d) return reply({error:"JT_AUTH_DB is not configured."},503);
  const base=typeof env?.SUPABASE_URL==="string"?env.SUPABASE_URL.replace(/\/$/,""):"";
  const anon=typeof env?.SUPABASE_ANON_KEY==="string"?env.SUPABASE_ANON_KEY:"";
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(base)||!anon) return reply({error:"Supabase Auth is not configured on this deployment."},503);
  const authorization=request.headers.get("authorization")||"";
  const match=authorization.match(/^Bearer\s+(.+)$/i);
  if(!match) return reply({error:"A Supabase access token is required."},401);

  let verified;
  try {
    const response=await fetch(base+"/auth/v1/user",{headers:{apikey:anon,authorization:"Bearer "+match[1]}});
    if(!response.ok) return reply({error:"Your sign-in could not be verified. Please sign in again."},401);
    verified=await response.json();
  } catch {
    return reply({error:"The identity service is temporarily unavailable."},503);
  }

  const authId=typeof verified.id==="string"?verified.id:"";
  const email=typeof verified.email==="string"?verified.email.trim().toLowerCase():"";
  const confirmed=Boolean(verified.email_confirmed_at||verified.confirmed_at);
  if(!authId||!email||!confirmed) return reply({error:"Verify your email with your sign-in provider before continuing."},403);

  try {
    const linked=await d.prepare(
      "SELECT u.id,u.name,u.email FROM jt_auth_identities i JOIN users u ON u.id=i.user_id WHERE i.auth_user_id=? LIMIT 1"
    ).bind(authId).first();
    let user=linked;
    if(!user) {
      // Link only to an exact email match after Supabase has confirmed the address.
      user=await d.prepare("SELECT id,name,email FROM users WHERE email=? LIMIT 1").bind(email).first();
      if(!user) {
        const id=randomToken(), now=Math.floor(Date.now()/1000);
        // OAuth-only accounts cannot use the legacy D1 password endpoint.
        await d.prepare("INSERT INTO users (id,name,email,password_hash,password_salt,created_at) VALUES (?,?,?,?,?,?)")
          .bind(id,(verified.user_metadata?.full_name||verified.user_metadata?.name||email.split("@")[0]).slice(0,80),email,"SUPABASE_AUTH_ONLY","SUPABASE_AUTH_ONLY",now).run();
        user={id,name:verified.user_metadata?.full_name||verified.user_metadata?.name||email.split("@")[0],email};
      }
      await d.prepare("INSERT OR IGNORE INTO jt_auth_identities (auth_user_id,user_id,email,created_at) VALUES (?,?,?,?)")
        .bind(authId,user.id,email,Math.floor(Date.now()/1000)).run();
      user=await d.prepare("SELECT id,name,email FROM users WHERE id=? LIMIT 1").bind(user.id).first();
    }
    const token=await createSession(user.id,env);
    return reply({user,authProvider:"supabase"},200,{"set-cookie":cookieHeader(token)});
  } catch(error) {
    const requestId=request.headers.get("cf-ray")||(typeof crypto.randomUUID==="function"?crypto.randomUUID():"jt-"+Date.now());
    console.error("JT Supabase identity link failed",{requestId,name:error?.name||"Error",message:error?.message||"Unknown error"});
    return reply({error:"JT Account could not link this sign-in. Please try again.",requestId},503);
  }
}
