# Supabase Foundation

This project now includes the first Supabase foundation for Voix.

## Added files

- `.env.example`
- `supabase/migrations/0001_voix_initial.sql`
- `src/types/database.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The browser and server clients use the publishable key, following the current Supabase SSR guidance. The admin client uses the service role key and must never be exposed to the browser.

## Current scope

This foundation is intentionally non-invasive:

- the app still works without a live Supabase project
- the existing demo UX continues to use the local workspace store
- the schema now exists so we can move from mocked state to real persistence next

## Next implementation step

Wire the local workspace store to a repository layer that can:

1. read from mocked local state during early UI work
2. switch to Supabase-backed persistence route by route

That will let us migrate onboarding, testimonials, widgets, and dashboard metrics without a hard cutover.
