import {db,reply,sameOrigin,validEmail,validPassword,passwordHash,randomToken,hash,cookieHeader} from "../_auth.js";

export async function onRequestPost({request,env}) {
  if (!sameOrigin(request)) return reply({error:"Origin not allowed."},403);

  const d=db(env);
  if (!d) return reply({error:"JT Account is temporarily unavailable. Please try again later."},503);

  let payload;
  try {
    payload=await request.json();
  } catch {
    return reply({error:"Invalid JSON."},400);
  }

  const name=typeof payload.name==="string"?payload.name.trim().slice(0,80):"";
  const email=typeof payload.email==="string"?payload.email.trim().toLowerCase():"";
  const password=payload.password;

  if (!name || !validEmail(email) || !validPassword(password)) {
    return reply({error:"Enter a name, valid email, and password of at least 10 characters."},400);
  }

  try {
    // Check duplicates explicitly so a uniqueness conflict is not confused with
    // a database outage or a failed session write.
    const existing=await d.prepare("SELECT id FROM users WHERE email=? LIMIT 1").bind(email).first();
    if (existing) return reply({error:"An account with that email already exists. Try signing in instead."},409);

    const salt=randomToken();
    const passHash=await passwordHash(password,salt);
    const id=randomToken();
    const token=randomToken();
    const tokenHash=await hash(token);
    const now=Math.floor(Date.now()/1000);
    const expires=now+30*86400;

    // D1 batch is transactional: the account and its first session are either
    // both committed or neither is. This prevents orphaned accounts when
    // session creation fails after user creation.
    await d.batch([
      d.prepare("INSERT INTO users (id,name,email,password_hash,password_salt,created_at) VALUES (?,?,?,?,?,?)")
        .bind(id,name,email,passHash,salt,now),
      d.prepare("INSERT INTO sessions (user_id,token_hash,expires_at,created_at) VALUES (?,?,?,?)")
        .bind(id,tokenHash,expires,now)
    ]);

    return reply({user:{id,name,email}},201,{"set-cookie":cookieHeader(token)});
  } catch (error) {
    // Keep internal database/crypto details out of the public response while
    // retaining a request-scoped diagnostic in Cloudflare's function logs.
    const requestId=request.headers.get("cf-ray")||crypto.randomUUID();
    console.error("JT Account signup failed", {requestId, name:error?.name||"Error", message:error?.message||"Unknown error"});
    return reply({error:"JT Account could not complete signup because a service is temporarily unavailable. Please try again shortly.",requestId},503);
  }
}
