const COOKIE="jt_session";
const DAY=86400;
export const headers={"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"};
export function reply(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{...headers,...extra}})}
export function db(env){return env?.JT_AUTH_DB||null}
export function sameOrigin(request){const origin=request.headers.get("origin");if(!origin)return true;try{return new URL(origin).origin===new URL(request.url).origin}catch{return false}}
export function cookie(request){const raw=request.headers.get("cookie")||"";const item=raw.split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="));return item?decodeURIComponent(item.slice(COOKIE.length+1)):""}
export function cookieHeader(token,maxAge=30*DAY){return COOKIE+"="+encodeURIComponent(token)+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+maxAge}
export async function hash(value){const bytes=new TextEncoder().encode(value);const digest=await crypto.subtle.digest("SHA-256",bytes);return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("")}
export async function passwordHash(password,salt){const material=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations:310000,hash:"SHA-256"},material,256);return [...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,"0")).join("")}
export function randomToken(){const b=crypto.getRandomValues(new Uint8Array(32));return btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}
export async function currentUser(request,env){const d=db(env);if(!d)return null;const token=cookie(request);if(!token)return null;const tokenHash=await hash(token);return await d.prepare("SELECT u.id,u.name,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? LIMIT 1").bind(tokenHash,Math.floor(Date.now()/1000)).first()}
export async function createSession(userId,env){const token=randomToken(),tokenHash=await hash(token),expires=Math.floor(Date.now()/1000)+30*DAY;await db(env).prepare("INSERT INTO sessions (user_id,token_hash,expires_at,created_at) VALUES (?,?,?,?)").bind(userId,tokenHash,expires,Math.floor(Date.now()/1000)).run();return token}
export function validEmail(v){return typeof v==="string"&&v.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
export function validPassword(v){return typeof v==="string"&&v.length>=10&&v.length<=128}
