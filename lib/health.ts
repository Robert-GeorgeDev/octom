import { APP_URL } from "@/lib/hosts";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase-config";

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
