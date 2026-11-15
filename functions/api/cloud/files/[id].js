import { cloudUser, cloudReply } from "../_shared.js";

function attachmentName(name) {
  const fallback = String(name || "download").replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 120) || "download";
  return 'attachment; filename="' + fallback.replace(/"/g, "") + '"; filename*=UTF-8\'\'' + encodeURIComponent(name || "download");
}

export async function onRequestGet({ request, env, params }) {
  const auth = await cloudUser(request, env, { requireBucket: true });
  if (auth.error) return auth.error;
  const id = String(params?.id || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return cloudReply({ error: "file_not_found" }, 404);
  const file = await auth.db.prepare("SELECT id,object_key,name,mime_type,size_bytes FROM cloud_files WHERE id=? AND user_id=? AND status='ready' LIMIT 1").bind(id, auth.user.id).first();
  if (!file) return cloudReply({ error: "file_not_found" }, 404);
  const object = await auth.bucket.get(file.object_key);
  if (!object) return cloudReply({ error: "object_missing", message: "The stored file is temporarily unavailable." }, 404);
  return new Response(object.body, { status: 200, headers: {
    "content-type": file.mime_type || "application/octet-stream",
    "content-length": String(file.size_bytes),
    "content-disposition": attachmentName(file.name),
    "cache-control": "private, no-store",
    "x-content-type-options": "nosniff"
  }});
}

export async function onRequestDelete({ request, env, params }) {
  const auth = await cloudUser(request, env, { mutate: true, requireBucket: true });
  if (auth.error) return auth.error;
  const id = String(params?.id || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return cloudReply({ error: "file_not_found" }, 404);
  const file = await auth.db.prepare("SELECT id,object_key,size_bytes FROM cloud_files WHERE id=? AND user_id=? AND status IN ('ready','deleting') LIMIT 1").bind(id, auth.user.id).first();
  if (!file) return cloudReply({ error: "file_not_found" }, 404);
  const now = Math.floor(Date.now() / 1000);
  await auth.db.prepare("UPDATE cloud_files SET status='deleting',updated_at=? WHERE id=? AND user_id=?").bind(now, id, auth.user.id).run();
  try { await auth.bucket.delete(file.object_key); }
  catch { return cloudReply({ error: "delete_pending", message: "Deletion is pending. Retry the operation later." }, 502); }
  await auth.db.prepare("DELETE FROM cloud_files WHERE id=? AND user_id=?").bind(id, auth.user.id).run();
  await auth.db.prepare("UPDATE cloud_storage_usage SET used_bytes=MAX(0,used_bytes-?),updated_at=? WHERE user_id=?").bind(file.size_bytes, now, auth.user.id).run();
  return cloudReply({ ok: true, deleted: id });
}
