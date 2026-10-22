import { APP_URL } from "@/lib/hosts";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import { schemaUpToDate } from "@/lib/schema-check";

export type HealthSnapshot = { app: boolean; database: boolean; schema: boolean | null };

const TTL_MS = 30_000;
let last: { at: number; value: Promise<HealthSnapshot> } | null = null;

/**
 * The public health endpoints share one result for 30 seconds per server, so
 * calling them in a loop cannot become a flood of database and outbound requests.
 */
export function healthSnapshot(): Promise<HealthSnapshot> {
  const now = Date.now();
  if (last && now - last.at < TTL_MS) return last.value;
  const value = (async () => {
    const [database, app] = await Promise.all([databaseUp(), appUp()]);
    // Only checked while the database answers; true / false / null (could not check).
    const schema = database ? await schemaUpToDate() : null;
    return { app, database, schema };
  })();
  last = { at: now, value };
  return value;
}

/** Whether the database service (Supabase auth) answers. */
export async function databaseUp(): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: SUPABASE_KEY },
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Whether the app (one.octom.eu) answers without a server error. */
export async function appUp(): Promise<boolean> {
  try {
    const res = await fetch(`${APP_URL}/login`, {
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
      redirect: "manual",
    });
    return res.status < 500;
  } catch {
    return false;
  }
}
