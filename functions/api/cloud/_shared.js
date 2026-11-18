import { db, currentUser, reply } from "../_auth.js";

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const DEFAULT_QUOTA_BYTES = 100 * 1024 * 1024;
const DEFAULT_STORAGE_BUCKET = "jt-cloud-private";

export function cloudReply(data, status = 200) {
  return reply(data, status, { "cache-control": "no-store", "x-content-type-options": "nosniff" });
}

export function sameOriginMutation(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}

export function safeFilename(raw) {
  if (typeof raw !== "string") return "";
  const leaf = raw.normalize("NFC").split("/").pop().split("\\").pop();
  const name = leaf.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 180);
  return !name || name === "." || name === ".." ? "" : name;
}

export function encodeCursor(createdAt, id) {
  const bytes = new TextEncoder().encode(String(createdAt) + "|" + String(id));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCursor(value) {
  if (!value || typeof value !== "string" || value.length > 512) return null;
  try {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
    const raw = new TextDecoder().decode(Uint8Array.from(binary, char => char.charCodeAt(0)));
    const split = raw.indexOf("|");
    if (split < 1) return null;
    const createdAt = Number(raw.slice(0, split));
    const id = raw.slice(split + 1);
    return Number.isSafeInteger(createdAt) && createdAt > 0 && /^[a-zA-Z0-9_-]{8,80}$/.test(id)
      ? { createdAt, id } : null;
  } catch { return null; }
}

export function storageConfig(env) {
  const endpoint = String(env?.SUPABASE_S3_ENDPOINT || "").trim().replace(/\/+$/, "");
  const accessKeyId = String(env?.SUPABASE_S3_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = String(env?.SUPABASE_S3_SECRET_ACCESS_KEY || "").trim();
  const region = String(env?.SUPABASE_S3_REGION || "").trim();
  const bucket = String(env?.JT_CLOUD_STORAGE_BUCKET || DEFAULT_STORAGE_BUCKET).trim();
  if (!endpoint || !accessKeyId || !secretAccessKey || !region || !/^[a-z0-9][a-z0-9._-]{1,62}$/i.test(bucket)) return null;
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return null;
    if (!url.pathname.endsWith("/storage/v1/s3")) return null;
    return { endpoint: url.toString().replace(/\\/$/, ""), accessKeyId, secretAccessKey, region, bucket };
  } catch { return null; }
}

function s3ObjectUrl(config, key) {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return config.endpoint + "/" + encodeURIComponent(config.bucket) + "/" + encodedKey;
}

async function signedStorageFetch(config, url, init) {
  const { AwsClient } = await import("aws4fetch");
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: "s3",
    region: config.region
  });
  return client.fetch(url, init);
}

export async function putCloudObject(env, key, body, contentType) {
  const config = storageConfig(env);
  if (!config) throw new Error("Supabase S3 Storage is not configured.");
  const response = await signedStorageFetch(config, s3ObjectUrl(config, key), {
    method: "PUT",
    headers: { "content-type": contentType, "cache-control": "3600" },
    body
  });
  if (!response.ok) throw new Error("Supabase S3 upload failed (" + response.status + ").");
  return response.headers.get("etag") || null;
}

export async function getCloudObject(env, key) {
  const config = storageConfig(env);
  if (!config) throw new Error("Supabase S3 Storage is not configured.");
  const response = await signedStorageFetch(config, s3ObjectUrl(config, key), { method: "GET" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Supabase S3 download failed (" + response.status + ").");
  return response;
}

export async function deleteCloudObject(env, key) {
  const config = storageConfig(env);
  if (!config) throw new Error("Supabase S3 Storage is not configured.");
  const response = await signedStorageFetch(config, s3ObjectUrl(config, key), { method: "DELETE" });
  if (!response.ok) throw new Error("Supabase S3 delete failed (" + response.status + ").");
}

export async function cloudUser(request, env, { mutate = false, requireBucket = false } = {}) {
  const d = db(env);
  if (!d) return { error: cloudReply({ error: "database_unavailable", message: "JT Cloud account storage is not configured." }, 503) };
  if (mutate && !sameOriginMutation(request)) {
    return { error: cloudReply({ error: "origin_not_allowed", message: "A same-origin request is required." }, 403) };
  }
  const user = await currentUser(request, env);
  if (!user) return { error: cloudReply({ error: "authentication_required", message: "Sign in to your JT Account to use remote storage." }, 401) };
  const storage = storageConfig(env);
  if (requireBucket && !storage) {
    return { error: cloudReply({ error: "storage_unavailable", message: "JT Cloud Supabase Storage is not configured for this environment yet." }, 503) };
  }
  return { db: d, user, storage };
}

export function limitUploadStream(body, expectedBytes) {
  let received = 0;
  return body.pipeThrough(new TransformStream({
    transform(chunk, controller) {
      received += chunk.byteLength;
      if (received > expectedBytes || received > MAX_FILE_BYTES) throw new Error("Upload size exceeded the declared limit.");
      controller.enqueue(chunk);
    },
    flush() {
      if (received !== expectedBytes) throw new Error("Upload size did not match the declared file size.");
    }
  }));
}

export function uploadMetadata(request) {
  const rawName = request.headers.get("x-jt-file-name") || "";
  let decodedName = rawName;
  try { decodedName = decodeURIComponent(rawName); } catch {}
  const name = safeFilename(decodedName);
  const size = Number(request.headers.get("x-jt-file-size") || request.headers.get("content-length"));
  const mime = (request.headers.get("content-type") || "application/octet-stream").split(";")[0].trim().toLowerCase();
  if (!name) return { error: "invalid_filename" };
  if (!Number.isSafeInteger(size) || size < 1) return { error: "invalid_size" };
  if (size > MAX_FILE_BYTES) return { error: "file_too_large" };
  if (!/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/.test(mime)) return { error: "invalid_content_type" };
  return { name, size, mime };
}
