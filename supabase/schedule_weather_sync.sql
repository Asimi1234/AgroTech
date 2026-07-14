-- Schedule the `sync-weather` edge function to refresh public.weather every
-- 3 hours via Supabase Cron. Idempotent.
--
-- PREREQUISITES (do these first, once):
--   1. Deploy the function:
--        supabase functions deploy sync-weather --no-verify-jwt
--   2. Set the shared secret the function checks:
--        supabase secrets set CRON_SECRET=<a-long-random-string>
--   3. In this file, replace <CRON_SECRET> below with that same value.
--      (PROJECT_REF is already filled in for this project.)
--
-- Then run this in the Supabase SQL editor.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Drop a previous schedule of the same name so this stays re-runnable.
select cron.unschedule('sync-weather')
where exists (select 1 from cron.job where jobname = 'sync-weather');

select cron.schedule(
  'sync-weather',
  '0 */3 * * *', -- every 3 hours, on the hour
  $$
  select net.http_post(
    url := 'https://dpelqbhpwusxaexboxic.functions.supabase.co/sync-weather',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '<CRON_SECRET>'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000  -- the function fetches + writes; 5s (default) is too short
  );
  $$
);

-- To run it once immediately (optional smoke test), execute the net.http_post
-- above on its own, or invoke the function from the CLI:
--   supabase functions invoke sync-weather --no-verify-jwt \
--     --header 'x-cron-secret: <CRON_SECRET>'
