# Database migrations

One file per database change, named `YYYYMMDD_NN_name.sql`, applied in that order.
Every file must be safe to run twice and must end by registering itself:

```sql
insert into public.app_migrations (name) values ('the-name') on conflict (name) do nothing;
```

Steps for a new change:

1. Write the file here, add its name to `lib/migrations.ts` (`REQUIRED_MIGRATIONS`) in the same pull request. A test fails if the two disagree.
2. Run the file in the Supabase SQL Editor on the test project, then on production, when the pull request is merged.
3. Open `/api/health`: `"schema": true` means every required file is registered. `false` means a file was forgotten.

`20261022_01_migration-tracking.sql` creates the tracking table and registers the older files in `supabase/` (they stay as history and as the recipe for a new project).
