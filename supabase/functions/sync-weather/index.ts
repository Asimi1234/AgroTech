// Supabase Edge Function: sync-weather
// Fetches a 5-day forecast per region from Open-Meteo (no API key needed) and
// refreshes public.weather. Runs on a schedule via Supabase Cron (see
// supabase/schedule_weather_sync.sql). Admin manual edits still act as overrides
// until the next run.
//
// Deploy:
//   supabase functions deploy sync-weather --no-verify-jwt
//   supabase secrets set CRON_SECRET=<a-long-random-string>
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// `location` MUST match the app's region labels (regionToLocation / regions[].label),
// so getWeather(region) finds these rows. Coordinates are each state's capital.
const REGIONS: { location: string; lat: number; lon: number }[] = [
  { location: 'Abia', lat: 5.53, lon: 7.49 },
  { location: 'Adamawa', lat: 9.2, lon: 12.48 },
  { location: 'Akwa Ibom', lat: 5.05, lon: 7.93 },
  { location: 'Anambra', lat: 6.21, lon: 7.07 },
  { location: 'Bauchi', lat: 10.31, lon: 9.84 },
  { location: 'Bayelsa', lat: 4.92, lon: 6.26 },
  { location: 'Benue', lat: 7.73, lon: 8.53 },
  { location: 'Borno', lat: 11.83, lon: 13.15 },
  { location: 'Cross River', lat: 4.98, lon: 8.34 },
  { location: 'Delta', lat: 6.2, lon: 6.73 },
  { location: 'Ebonyi', lat: 6.32, lon: 8.11 },
  { location: 'Edo', lat: 6.34, lon: 5.62 },
  { location: 'Ekiti', lat: 7.62, lon: 5.22 },
  { location: 'Enugu', lat: 6.46, lon: 7.51 },
  { location: 'FCT (Abuja)', lat: 9.06, lon: 7.49 },
  { location: 'Gombe', lat: 10.29, lon: 11.17 },
  { location: 'Imo', lat: 5.48, lon: 7.03 },
  { location: 'Jigawa', lat: 11.76, lon: 9.34 },
  { location: 'Kaduna', lat: 10.52, lon: 7.44 },
  { location: 'Kano', lat: 12.0, lon: 8.52 },
  { location: 'Katsina', lat: 12.99, lon: 7.6 },
  { location: 'Kebbi', lat: 12.45, lon: 4.2 },
  { location: 'Kogi', lat: 7.8, lon: 6.74 },
  { location: 'Kwara', lat: 8.5, lon: 4.55 },
  { location: 'Lagos', lat: 6.52, lon: 3.38 },
  { location: 'Nasarawa', lat: 8.49, lon: 8.52 },
  { location: 'Niger', lat: 9.61, lon: 6.55 },
  { location: 'Ogun', lat: 7.15, lon: 3.35 },
  { location: 'Ondo', lat: 7.25, lon: 5.2 },
  { location: 'Osun', lat: 7.77, lon: 4.56 },
  { location: 'Oyo', lat: 7.38, lon: 3.9 },
  { location: 'Plateau', lat: 9.9, lon: 8.86 },
  { location: 'Rivers', lat: 4.82, lon: 7.03 },
  { location: 'Sokoto', lat: 13.06, lon: 5.24 },
  { location: 'Taraba', lat: 8.89, lon: 11.36 },
  { location: 'Yobe', lat: 11.75, lon: 11.97 },
  { location: 'Zamfara', lat: 12.16, lon: 6.66 },
];

type Condition = 'sunny' | 'partly-cloudy' | 'cloudy' | 'rain' | 'storm';

/** Map a WMO weather code to the app's condition enum. */
function toCondition(code: number): Condition {
  if (code >= 95) return 'storm'; // thunderstorm (95, 96, 99)
  if (code >= 51) return 'rain'; // drizzle / rain / showers / snow (51–86)
  if (code === 3 || code === 45 || code === 48) return 'cloudy';
  if (code === 2) return 'partly-cloudy';
  return 'sunny'; // 0, 1
}

const SUMMARY: Record<Condition, string> = {
  sunny: 'Clear and sunny',
  'partly-cloudy': 'Partly cloudy',
  cloudy: 'Cloudy',
  rain: 'Rain expected',
  storm: 'Thunderstorms likely',
};

interface OpenMeteo {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weather_code: number[];
  };
}

async function rowsForRegion(r: (typeof REGIONS)[number]) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${r.lat}&longitude=${r.lon}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
    `&timezone=Africa%2FLagos&forecast_days=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status} for ${r.location}`);
  const data = (await res.json()) as OpenMeteo;

  return data.daily.time.map((date, i) => {
    const isToday = i === 0;
    const rainfall = Math.round(data.daily.precipitation_sum[i] ?? 0);
    const condition = toCondition(
      isToday ? data.current.weather_code : data.daily.weather_code[i],
    );
    const temperature = isToday
      ? Math.round(data.current.temperature_2m)
      : Math.round(
          (data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2,
        );
    const humidity = isToday
      ? Math.round(data.current.relative_humidity_2m)
      : Math.min(95, Math.round(55 + rainfall * 3));
    return {
      location: r.location,
      date,
      temperature,
      rainfall,
      forecast: SUMMARY[condition],
      condition,
      humidity,
    };
  });
}

Deno.serve(async (req) => {
  // Gate invocation with a shared secret so only the scheduler can trigger it.
  const secret = Deno.env.get('CRON_SECRET');
  if (secret && req.headers.get('x-cron-secret') !== secret) {
    return new Response('Forbidden', { status: 403 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const today = new Date().toISOString().slice(0, 10);
  const results = await Promise.allSettled(
    REGIONS.map(async (r) => {
      const rows = await rowsForRegion(r);
      // Replace this region's current-and-future window with the fresh forecast.
      await supabase
        .from('weather')
        .delete()
        .eq('location', r.location)
        .gte('date', today);
      const { error } = await supabase.from('weather').insert(rows);
      if (error) throw new Error(`${r.location}: ${error.message}`);
      return r.location;
    }),
  );

  const ok = results.filter((x) => x.status === 'fulfilled').length;
  const failed = results
    .filter((x): x is PromiseRejectedResult => x.status === 'rejected')
    .map((x) => String(x.reason));

  return new Response(JSON.stringify({ updated: ok, failed }), {
    status: failed.length && !ok ? 502 : 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
