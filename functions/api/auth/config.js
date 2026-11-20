export async function onRequestGet({env}) {
  const url=typeof env?.SUPABASE_URL==="string"?env.SUPABASE_URL.replace(/\/$/,""):"";
  const key=typeof env?.SUPABASE_ANON_KEY==="string"?env.SUPABASE_ANON_KEY:"";
  const validUrl=/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url);
  return new Response(JSON.stringify({configured:Boolean(validUrl&&key),url:validUrl?url:"",anonKey:validUrl?key:""}),{
    headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}
  });
}
