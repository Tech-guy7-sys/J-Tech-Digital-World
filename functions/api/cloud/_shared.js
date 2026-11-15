import { db, currentUser, reply } from "../_auth.js";

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const DEFAULT_QUOTA_BYTES = 1024 * 1024 * 1024;

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
  return btoa(unescape(encodeURIComponent(String(createdAt) + "|" + String(id))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeCursor(value) {
  if (!value || typeof value !== "string" || value.length > 512) return null;
  try {
    const raw = decodeURIComponent(escape(atob(value.replace(/-/g, "+").replace(/_/g, "/"))));
    const split = raw.indexOf("|");
    if (split < 1) return null;
    const createdAt = Number(raw.slice(0, split));
    const id = raw.slice(split + 1);
    return Number.isSafeInteger(createdAt) && createdAt > 0 && /^[a-zA-Z0-9_-]{8,80}$/.test(id)
      ? { createdAt, id } : null;
  } catch { return null; }
}

export async function cloudUser(request, env, { mutate = false, requireBucket = false } = {}) {
  const d = db(env);
  if (!d) return { error: cloudReply({ error: "database_unavailable", message: "JT Cloud account storage is not configured." }, 503) };
  if (mutate && !sameOriginMutation(request)) {
    return { error: cloudReply({ error: "origin_not_allowed", message: "A same-origin request is required." }, 403) };
  }
  const user = await currentUser(request, env);
  if (!user) return { error: cloudReply({ error: "authentication_required", message: "Sign in to your JT Account to use remote storage." }, 401) };
  if (requireBucket && !env?.JT_CLOUD_BUCKET) {
    return { error: cloudReply({ error: "storage_unavailable", message: "JT Cloud remote storage is not configured for this environment yet." }, 503) };
  }
  return { db: d, user, bucket: env?.JT_CLOUD_BUCKET || null };
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
  const name = safeFilename(request.headers.get("x-jt-file-name") || "");
  const size = Number(request.headers.get("x-jt-file-size") || request.headers.get("content-length"));
  const mime = (request.headers.get("content-type") || "application/octet-stream").split(";")[0].trim().toLowerCase();
  if (!name) return { error: "invalid_filename" };
  if (!Number.isSafeInteger(size) || size < 1) return { error: "invalid_size" };
  if (size > MAX_FILE_BYTES) return { error: "file_too_large" };
  if (!/^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/.test(mime)) return { error: "invalid_content_type" };
  return { name, size, mime };
}
