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
  const isSso=Array.isArray(verified.identities)&&verified.identities.some(identity=>String(identity.provider||"").startsWith("sso:"));

  let stage="identity-lookup";
  try {
    const linked=await d.prepare(
      "SELECT u.id,u.name,u.email FROM jt_auth_identities i JOIN users u ON u.id=i.user_id WHERE i.auth_user_id=? LIMIT 1"
    ).bind(authId).first();
    let user=linked;
    if(!user) {
      // SAML identities require explicit JT administrator provisioning.
      if(isSso) return reply({error:"This enterprise SSO identity needs JT administrator provisioning before it can access JT account data."},403);
      stage="email-lookup";
      user=await d.prepare("SELECT id,name,email FROM users WHERE email=? LIMIT 1").bind(email).first();
      if(!user) {
        stage="identity-create";
        const id=randomToken(), now=Math.floor(Date.now()/1000);
        const metadata=verified.user_metadata||{};
        const displayName=[metadata.full_name,metadata.name].find(value=>typeof value==="string"&&value.trim())||email.split("@")[0];
        user={id,name:displayName.trim().slice(0,80),email};
        await d.batch([
          d.prepare("INSERT INTO users (id,name,email,password_hash,password_salt,created_at) VALUES (?,?,?,?,?,?)")
            .bind(id,user.name,email,"SUPABASE_AUTH_ONLY","SUPABASE_AUTH_ONLY",now),
          d.prepare("INSERT INTO jt_auth_identities (auth_user_id,user_id,email,created_at) VALUES (?,?,?,?)")
            .bind(authId,id,email,now)
        ]);
      } else {
        stage="identity-create";
        await d.prepare("INSERT INTO jt_auth_identities (auth_user_id,user_id,email,created_at) VALUES (?,?,?,?)")
          .bind(authId,user.id,email,Math.floor(Date.now()/1000)).run();
      }
      stage="identity-refresh";
      user=await d.prepare("SELECT id,name,email FROM users WHERE id=? LIMIT 1").bind(user.id).first();
      if(!user) throw new Error("Linked JT user could not be reloaded.");
    }

    // Supabase Auth owns password verification after a provider identity is linked.
    stage="legacy-password-disable";
    await d.prepare("UPDATE users SET password_hash=?,password_salt=? WHERE id=?")
      .bind("SUPABASE_AUTH_ONLY","SUPABASE_AUTH_ONLY",user.id).run();

    stage="session-create";
    const token=await createSession(user.id,env);
    return reply({user,authProvider:"supabase"},200,{"set-cookie":cookieHeader(token)});
  } catch(error) {
    const requestId=request.headers.get("cf-ray")||(typeof crypto.randomUUID==="function"?crypto.randomUUID():"jt-"+Date.now());
    console.error("JT Supabase identity link failed",{requestId,stage,name:error?.name||"Error",message:error?.message||"Unknown error"});
    return reply({error:"JT Account could not link this sign-in. Please try again.",requestId,diagnosticStage:stage},503);
  }
}
