import { createClient } from "@supabase/supabase-js";

/**
 * Simple sliding-window rate limit backed by public.rate_limits.
 * Returns { ok, remaining }. Best-effort — failures fall open.
 */
export async function checkRateLimit(opts: {
  bucket: string;
  key: string;
  limit: number;
  windowSec: number;
}): Promise<{ ok: boolean; remaining: number }> {
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) return { ok: true, remaining: opts.limit };
  const supa = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const windowMs = opts.windowSec * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs).toISOString();
  try {
    const { data: existing } = await supa
      .from("rate_limits")
      .select("id,count")
      .eq("bucket", opts.bucket).eq("key", opts.key).eq("window_start", windowStart)
      .maybeSingle();
    if (existing) {
      const next = (existing as any).count + 1;
      await supa.from("rate_limits").update({ count: next }).eq("id", (existing as any).id);
      return { ok: next <= opts.limit, remaining: Math.max(0, opts.limit - next) };
    }
    await supa.from("rate_limits").insert({ bucket: opts.bucket, key: opts.key, count: 1, window_start: windowStart });
    return { ok: true, remaining: opts.limit - 1 };
  } catch {
    return { ok: true, remaining: opts.limit };
  }
}

export function clientKey(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
