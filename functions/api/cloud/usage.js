import { cloudUser, cloudReply, DEFAULT_QUOTA_BYTES } from "./_shared.js";

export async function onRequestGet({ request, env }) {
  const auth = await cloudUser(request, env);
  if (auth.error) return auth.error;
  const now = Math.floor(Date.now() / 1000);
  const defaultQuota = Number(env.JT_CLOUD_DEFAULT_QUOTA_BYTES) > 0 ? Number(env.JT_CLOUD_DEFAULT_QUOTA_BYTES) : DEFAULT_QUOTA_BYTES;
  await auth.db.prepare("INSERT OR IGNORE INTO cloud_storage_usage (user_id,used_bytes,quota_bytes,updated_at) VALUES (?,0,?,?)").bind(auth.user.id, defaultQuota, now).run();
  const usage = await auth.db.prepare("SELECT used_bytes,quota_bytes FROM cloud_storage_usage WHERE user_id=? LIMIT 1").bind(auth.user.id).first();
  return cloudReply({
    storage: "remote",
    provider: "supabase",
    usedBytes: Number(usage?.used_bytes || 0),
    quotaBytes: Number(usage?.quota_bytes || defaultQuota),
    remainingBytes: Math.max(0, Number(usage?.quota_bytes || defaultQuota) - Number(usage?.used_bytes || 0))
  });
}
