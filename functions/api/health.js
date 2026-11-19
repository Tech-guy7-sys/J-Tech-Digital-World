import {db,reply} from "./_auth.js";

export async function onRequestGet({env,request}) {
  const d=db(env);
  if(!d) return reply({
    ok:false,
    authConfigured:false,
    databaseReachable:false,
    schemaReady:false,
    message:"JT Account database binding is not configured."
  });

  const requestId=request.headers.get("cf-ray")||
    (typeof crypto.randomUUID==="function"?crypto.randomUUID():"jt-"+Date.now());

  try {
    const result=await d.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users','sessions','account_preferences')"
    ).all();
    const found=new Set((result.results||[]).map(row=>row.name));
    const missingTables=["users","sessions","account_preferences"].filter(name=>!found.has(name));

    if(missingTables.length) {
      return reply({
        ok:false,
        authConfigured:true,
        databaseReachable:true,
        schemaReady:false,
        missingTables,
        message:"The JT Account database is reachable, but its schema is incomplete. Apply db/auth-schema.sql to the database bound as JT_AUTH_DB."
      });
    }

    // Validate the columns used by signup, sessions and account settings without
    // reading or returning any user records.
    await Promise.all([
      d.prepare("SELECT id,name,email,password_hash,password_salt,created_at FROM users LIMIT 0").all(),
      d.prepare("SELECT id,user_id,token_hash,expires_at,created_at FROM sessions LIMIT 0").all(),
      d.prepare("SELECT user_id,theme,product_updates,diagnostics_sharing,updated_at FROM account_preferences LIMIT 0").all()
    ]);

    return reply({
      ok:true,
      authConfigured:true,
      databaseReachable:true,
      schemaReady:true,
      message:"JT Account database and required schema are ready."
    });
  } catch(error) {
    console.error("JT Account health check failed", {
      requestId,
      name:error?.name||"Error",
      message:error?.message||"Unknown error"
    });
    return reply({
      ok:false,
      authConfigured:true,
      databaseReachable:false,
      schemaReady:false,
      requestId,
      message:"JT Account could not verify its database schema. Check the Cloudflare Pages Function logs using the reference number."
    });
  }
}
