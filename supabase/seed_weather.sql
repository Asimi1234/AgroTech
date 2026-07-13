-- Seed a rolling 5-day forecast per region into public.weather.
-- Run in the Supabase SQL editor (runs as owner, bypasses RLS — the anon key
-- can't write here). Idempotent: re-running refreshes the window to start today.
--
-- Dates are relative to `current_date`, so the forecast always begins "today"
-- and rolls forward as the migration is re-run. Humidity mirrors the backfill
-- formula in align_schema.sql. Conditions satisfy weather_condition_check.

begin;

-- Clear existing rows for the seeded regions so the window doesn't accumulate
-- stale days on re-run.
delete from public.weather
where location in ('Kaduna', 'Oyo', 'Cross River');

insert into public.weather
  (location, date, temperature, rainfall, forecast, condition, humidity)
select
  v.location,
  current_date + v.day_offset,
  v.temperature,
  v.rainfall,
  v.forecast,
  v.condition,
  least(95, round(55 + v.rainfall * 3))
from (values
  -- Kaduna (north): hotter, intermittent showers
  ('Kaduna',      0, 28.5,  5.2, 'Sunny with afternoon showers', 'rain'),
  ('Kaduna',      1, 30.0,  2.0, 'Partly cloudy',                'partly-cloudy'),
  ('Kaduna',      2, 29.0, 12.0, 'Rain likely',                  'rain'),
  ('Kaduna',      3, 27.0, 18.0, 'Thunderstorms',                'storm'),
  ('Kaduna',      4, 31.0,  3.0, 'Mostly sunny',                 'sunny'),
  -- Oyo (southwest): wetter mid-week
  ('Oyo',         0, 27.1,  8.0, 'Cloudy, heavy rain expected',  'rain'),
  ('Oyo',         1, 28.0, 14.0, 'Rain',                         'rain'),
  ('Oyo',         2, 27.0, 22.0, 'Thunderstorms',                'storm'),
  ('Oyo',         3, 29.0,  5.0, 'Partly cloudy',                'partly-cloudy'),
  ('Oyo',         4, 30.0,  1.0, 'Sunny',                        'sunny'),
  -- Cross River (south): rainy season in full swing
  ('Cross River', 0, 26.8, 12.0, 'Rainy season in full swing',   'rain'),
  ('Cross River', 1, 27.0, 20.0, 'Heavy rain',                   'rain'),
  ('Cross River', 2, 28.0, 16.0, 'Thunderstorms',                'storm'),
  ('Cross River', 3, 27.0, 10.0, 'Rain',                         'rain'),
  ('Cross River', 4, 28.0,  7.0, 'Partly cloudy',                'partly-cloudy')
) as v(location, day_offset, temperature, rainfall, forecast, condition);

commit;
