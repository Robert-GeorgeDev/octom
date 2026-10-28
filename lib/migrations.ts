// Database changes the app needs. The name is what each file in
// supabase/migrations/ registers in the app_migrations table (see the README there).
// The older changes, applied by hand before tracking, are registered by the first file.
export const REQUIRED_MIGRATIONS = [
  "security-fixes",
  "security-hardening-2",
  "security-hardening-3",
  "remove-bootstrap",
  "contacts-v2",
  "launch-readiness",
  "remove-plans",
  "migration-tracking",
  "follow-up-cadences",
  "follow-up-cadences-strict",
] as const;
