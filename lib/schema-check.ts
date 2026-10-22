import { adminClient } from "@/lib/supabase-admin";
import { REQUIRED_MIGRATIONS } from "@/lib/migrations";

/**
 * Whether every required database change is registered.
 * true = up to date, false = something is missing, null = could not check.
 * Missing names are only written to the server log, never returned.
 */
export async function schemaUpToDate(): Promise<boolean | null> {
  try {
    const { data, error } = await adminClient().from("app_migrations").select("name");
    if (error) {
      console.error("schema check: could not read app_migrations", error.message);
      return false;
    }
    const have = new Set((data ?? []).map((r) => r.name as string));
    const missing = REQUIRED_MIGRATIONS.filter((n) => !have.has(n));
    if (missing.length > 0) console.error(`schema check: missing database changes: ${missing.join(", ")}`);
    return missing.length === 0;
  } catch {
    return null;
  }
}
