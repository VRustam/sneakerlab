# Supabase workspace

This directory contains ordered migrations, deterministic seed data, RLS policies, storage policies, and database security tests.

## Local validation

```bash
pnpm exec supabase start
pnpm exec supabase db reset
pnpm exec supabase test db
```

`db reset` applies migrations in timestamp order and loads `seed.sql`. The pgTAP suite in `tests/` checks key schema, RLS, constraints, and seed expectations.

## Regenerate web database types

```bash
pnpm exec supabase gen types typescript --local > apps/web/src/lib/supabase/database.types.ts
```

## Safe admin assignment

Use a privileged database session or the Supabase SQL Editor after confirming the intended test account UUID:

```sql
update public.profiles
set role = 'admin'
where id = '<auth-user-uuid>';
```

Never expose a service-role key to the browser or Flutter app. The normal application uses only the public URL, anonymous key, and authenticated user session.
