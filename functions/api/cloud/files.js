import { cloudUser, cloudReply, uploadMetadata, limitUploadStream, encodeCursor, decodeCursor, DEFAULT_QUOTA_BYTES } from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const auth = await cloudUser(request, env);
  if (auth.error) return auth.error;
  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(100, Number.parseInt(url.searchParams.get("limit") || "50", 10) || 50));
  const cursorText = url.searchParams.get("cursor");
  const cursor = cursorText ? decodeCursor(cursorText) : null;
  if (cursorText && !cursor) return cloudReply({ error: "invalid_cursor" }, 400);
  const query = (url.searchParams.get("q") || "").trim().slice(0, 120);
  let sql = "SELECT id,name,mime_type,size_bytes,folder_id,created_at,updated_at FROM cloud_files WHERE user_id=? AND status='ready'";
  const args = [auth.user.id];
  if (query) { sql += " AND instr(lower(name),lower(?))>0"; args.push(query); }
  if (cursor) { sql += " AND (created_at < ? OR (created_at = ? AND id < ?))"; args.push(cursor.createdAt, cursor.createdAt, cursor.id); }
  sql += " ORDER BY created_at DESC,id DESC LIMIT ?";
  args.push(limit + 1);
  const result = await auth.db.prepare(sql).bind(...args).all();
  const rows = result.results || [];
  const hasMore = rows.length > limit;
  const items = rows.slice(0, limit);
  const last = items[items.length - 1];
  return cloudReply({ files: items, nextCursor: hasMore && last ? encodeCursor(last.created_at, last.id) : null });
}

export async function onRequestPost({ request, env }) {
  const auth = await cloudUser(request, env, { mutate: true, requireBucket: true });
  if (auth.error) return auth.error;
  const meta = uploadMetadata(request);
  if (meta.error) {
    const status = meta.error === "file_too_large" ? 413 : 400;
    return cloudReply({ error: meta.error, message: meta.error === "file_too_large" ? "Files are limited to 25 MiB in this upload endpoint." : "Provide a valid filename, content type and content size." }, status);
  }
  if (!request.body) return cloudReply({ error: "empty_upload" }, 400);
  const now = Math.floor(Date.now() / 1000);
  const id = crypto.randomUUID();
  const key = "users/" + auth.user.id + "/" + id;
  const quota = Number(env.JT_CLOUD_DEFAULT_QUOTA_BYTES) > 0 ? Number(env.JT_CLOUD_DEFAULT_QUOTA_BYTES) : DEFAULT_QUOTA_BYTES;
  await auth.db.prepare("INSERT OR IGNORE INTO cloud_storage_usage (user_id,used_bytes,quota_bytes,updated_at) VALUES (?,0,?,?)").bind(auth.user.id, quota, now).run();
  const reserve = await auth.db.prepare("UPDATE cloud_storage_usage SET used_bytes=used_bytes+?,updated_at=? WHERE user_id=? AND used_bytes+?<=quota_bytes").bind(meta.size, now, auth.user.id, meta.size).run();
  if (reserve.meta?.changes !== 1) return cloudReply({ error: "quota_exceeded", message: "This upload would exceed your JT Cloud storage allowance." }, 413);
  let object;
  try {
    object = await auth.bucket.put(key, limitUploadStream(request.body, meta.size), { httpMetadata: { contentType: meta.mime }, customMetadata: { owner: auth.user.id, fileId: id } });
    await auth.db.prepare("INSERT INTO cloud_files (id,user_id,folder_id,object_key,name,mime_type,size_bytes,etag,status,created_at,updated_at) VALUES (?,?,NULL,?,?,?,?,?,'ready',?,?)")
      .bind(id, auth.user.id, key, meta.name, meta.mime, meta.size, object?.etag || null, now, now).run();
  } catch {
    if (object) await auth.bucket.delete(key).catch(() => {});
    await auth.db.prepare("UPDATE cloud_storage_usage SET used_bytes=MAX(0,used_bytes-?),updated_at=? WHERE user_id=?").bind(meta.size, now, auth.user.id).run().catch(() => {});
    return cloudReply({ error: "upload_failed", message: "The upload could not be completed. Your storage reservation was released." }, 502);
  }
  return cloudReply({ file: { id, name: meta.name, mime_type: meta.mime, size_bytes: meta.size, created_at: now }, storage: "remote" }, 201);
}
