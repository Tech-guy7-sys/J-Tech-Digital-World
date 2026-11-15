const HEADERS = {"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"};
const MODEL = "@cf/black-forest-labs/flux-1-schnell";
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:HEADERS})}
function originAllowed(request){const origin=request.headers.get("origin");if(!origin)return true;try{return new URL(origin).origin===new URL(request.url).origin}catch{return false}}
function freePlanConfirmed(env){return String(env?.CLOUDFLARE_WORKERS_PLAN||"").toLowerCase()==="free"&&String(env?.CLOUDFLARE_AI_FREE_TIER_CONFIRMED||"").toLowerCase()==="true"}
export async function onRequestPost({request,env}){
  if(!originAllowed(request))return json({error:"origin_not_allowed",message:"Cross-origin requests are not allowed."},403);
  if(!(request.headers.get("content-type")||"").toLowerCase().includes("application/json"))return json({error:"invalid_content_type",message:"Send a JSON request."},415);
  if(!freePlanConfirmed(env))return json({error:"free_tier_not_confirmed",message:"Image generation is disabled until the Cloudflare Workers Free plan and free-only setting are confirmed."},503);
  if(!env?.AI||typeof env.AI.run!=="function")return json({error:"workers_ai_binding_missing",message:"The Cloudflare Workers AI binding named AI is not configured for this Pages project."},503);
  let payload;try{payload=await request.json()}catch{return json({error:"invalid_json",message:"The request body must be valid JSON."},400)}
  if(!payload||typeof payload!=="object"||Array.isArray(payload))return json({error:"invalid_request",message:"A JSON object is required."},400);
  const prompt=typeof payload.prompt==="string"?payload.prompt.trim():"";
  if(prompt.length<8)return json({error:"prompt_too_short",message:"Describe the image in at least 8 characters."},400);
  if(prompt.length>1200)return json({error:"prompt_too_long",message:"Image prompts must be 1,200 characters or fewer."},413);
  const seed=Number.isInteger(payload.seed)&&payload.seed>=0&&payload.seed<=2147483647?payload.seed:undefined;
  try{
    const input=seed===undefined?{prompt}:{prompt,seed};
    const output=await env.AI.run(MODEL,input);
    const image=typeof output?.image==="string"?output.image:"";
    if(!image)return json({error:"empty_image_response",message:"The free image model returned no image. Please retry."},502);
    return json({imageDataUrl:"data:image/jpeg;base64,"+image,provider:"Cloudflare Workers AI",model:MODEL,costPolicy:"free-tier-only"});
  }catch{return json({error:"free_image_service_unavailable",message:"The free image quota may be exhausted or the model is temporarily unavailable. No paid fallback was used."},503)}
}
