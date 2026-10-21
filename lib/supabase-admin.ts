import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase-config";

// Server-only client with the service key. Never import it into browser code.
export function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("service_key_missing");
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } });
}
