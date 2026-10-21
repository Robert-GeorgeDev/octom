import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase-config";

// Rate limiting that survives restarts and works across servers, using the
// public.hit_rate_limit() function from supabase/launch-readiness.sql.
// If the database is unreachable (or the SQL has not been run yet) it falls back
// to a per-server in-memory counter, so a missing table never blocks real users.

const memory = new Map<string, { count: number; reset: number }>();

function memoryLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (memory.size > 5_000) {
    for (const [k, v] of memory) if (v.reset < now) memory.delete(k);
  }
  const entry = memory.get(key);
  if (!entry || entry.reset < now) {
    memory.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

/** Stable, non-reversible key part, so raw IP addresses are never stored. */
export function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

export async function isRateLimited(
  bucket: string,
  id: string,
  max: number,
  windowSecs: number
): Promise<boolean> {
  const key = `${bucket}:${hashKey(id)}`;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    try {
      const db = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
      const { data, error } = await db.rpc("hit_rate_limit", {
        p_key: key,
        p_max: max,
        p_window_secs: windowSecs,
      });
      if (!error && typeof data === "boolean") return data;
    } catch {
      /* fall through to memory */
    }
  }
  return memoryLimited(key, max, windowSecs * 1000);
}
