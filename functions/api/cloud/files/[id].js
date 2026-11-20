import { cloudUser, cloudReply, getCloudObject, deleteCloudObject } from "../_shared.js";

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
  let object;
  try { object = await getCloudObject(env, file.object_key); }
  catch { return cloudReply({ error: "download_failed", message: "The stored file is temporarily unavailable." }, 502); }
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
  const file = await auth.db.prepare("SELECT id,object_key,size_bytes,status,updated_at FROM cloud_files WHERE id=? AND user_id=? AND status IN ('ready','deleting') LIMIT 1").bind(id, auth.user.id).first();
  if (!file) return cloudReply({ error: "file_not_found" }, 404);
  const now = Math.floor(Date.now() / 1000);
  const claim = await auth.db.prepare("UPDATE cloud_files SET status='deleting',updated_at=? WHERE id=? AND user_id=? AND (status='ready' OR (status='deleting' AND updated_at<?))").bind(now, id, auth.user.id, now - 30).run();
  if (claim.meta?.changes !== 1) return cloudReply({ error: "delete_in_progress", message: "This file is already being deleted. Refresh the file list." }, 409);
  try { await deleteCloudObject(env, file.object_key); }
  catch {
    await auth.db.prepare("UPDATE cloud_files SET status='ready',updated_at=? WHERE id=? AND user_id=? AND status='deleting'").bind(now, id, auth.user.id).run().catch(() => {});
    return cloudReply({ error: "delete_failed", message: "The file could not be deleted. You can retry." }, 502);
  }
  const removed = await auth.db.prepare("DELETE FROM cloud_files WHERE id=? AND user_id=? AND status='deleting'").bind(id, auth.user.id).run();
  if (removed.meta?.changes !== 1) return cloudReply({ error: "delete_cleanup_pending", message: "The object was removed; metadata cleanup needs to be retried." }, 502);
  await auth.db.prepare("UPDATE cloud_storage_usage SET used_bytes=MAX(0,used_bytes-?),updated_at=? WHERE user_id=?").bind(file.size_bytes, now, auth.user.id).run();
  return cloudReply({ ok: true, deleted: id });
}
