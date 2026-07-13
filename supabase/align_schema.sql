-- Align the Supabase schema with the app's domain types (src/types/index.ts).
-- Idempotent: safe to run more than once. Paste into the Supabase SQL editor.
-- Closes the gaps SupabaseApi would otherwise infer/default: PIN, user status,
-- product category/unit/stock, weather condition/humidity, advisory
-- severity/window, group description + member role, and supplier inquiries.
-- Reserved keywords "unit" and "window" are quoted so Postgres accepts them.

begin;

-- ---------------------------------------------------------------------------
-- USERS: auth PIN + activation status + last-active timestamp
-- ---------------------------------------------------------------------------
alter table users add column if not exists pin text not null default '1234';
alter table users add column if not exists status text not null default 'active';
alter table users add column if not exists last_active timestamptz;

update users set last_active = coalesce(last_active, created_at);

-- Constrain status to the app's enum.
alter table users drop constraint if exists users_status_check;
alter table users add constraint users_status_check
  check (status in ('active', 'inactive'));

-- ---------------------------------------------------------------------------
-- PRODUCTS: category, unit, stock flag  (backfilled to mirror guessCategory)
-- ---------------------------------------------------------------------------
alter table products add column if not exists category text;
alter table products add column if not exists "unit" text;
alter table products add column if not exists in_stock boolean not null default true;

-- Patterns and the name+description search mirror guessCategory() in
-- src/services/api.ts exactly so the one-time backfill and the runtime fallback
-- agree (note 'protection' in the crop-protection set).
update products set category = case
  when name || ' ' || coalesce(description, '') ~* 'seed|cutting|seedling|stem|sapling'                        then 'seed'
  when name || ' ' || coalesce(description, '') ~* 'fertil|manure|npk|urea|nutrient|compost'                   then 'fertilizer'
  when name || ' ' || coalesce(description, '') ~* 'herbicide|pesticide|fungicide|insecticide|protection|spray' then 'crop-protection'
  when name || ' ' || coalesce(description, '') ~* 'tractor|equipment|sprayer|machine|tool|pump|tiller'        then 'equipment'
  else 'produce'
end
where category is null;

update products set "unit" = case category
  when 'seed'            then 'per kg'
  when 'fertilizer'      then 'per bag'
  when 'crop-protection' then 'per litre'
  when 'equipment'       then 'per unit'
  else 'per kg'
end
where "unit" is null;

alter table products drop constraint if exists products_category_check;
alter table products add constraint products_category_check
  check (category in ('seed', 'fertilizer', 'equipment', 'crop-protection', 'produce'));

-- ---------------------------------------------------------------------------
-- WEATHER: condition + humidity  (backfilled from the free-text forecast)
-- ---------------------------------------------------------------------------
alter table weather add column if not exists condition text;
alter table weather add column if not exists humidity numeric;

update weather set condition = case
  when forecast ~* 'storm|thunder'          then 'storm'
  when forecast ~* 'rain|shower|drizzle|wet' then 'rain'
  when forecast ~* 'partly'                  then 'partly-cloudy'
  when forecast ~* 'cloud|overcast'          then 'cloudy'
  else 'sunny'
end
where condition is null;

update weather set humidity = least(95, round(55 + coalesce(rainfall, 0) * 3))
where humidity is null;

alter table weather drop constraint if exists weather_condition_check;
alter table weather add constraint weather_condition_check
  check (condition in ('sunny', 'partly-cloudy', 'cloudy', 'rain', 'storm'));

-- ---------------------------------------------------------------------------
-- ADVISORIES: severity + window  (backfilled to mirror inferSeverity)
-- ---------------------------------------------------------------------------
alter table advisories add column if not exists severity text not null default 'info';
alter table advisories add column if not exists "window" text not null default '';

update advisories set severity = case
  when title ~* 'urgent|immediat|warning|disease|outbreak|pest|flood|drought|alert'
    or content ~* 'urgent|immediat|warning|disease|outbreak|pest|flood|drought|alert' then 'warning'
  when title ~* 'apply|spray|harvest|plant|fertil|irrigat|action|before|now'
    or content ~* 'apply|spray|harvest|plant|fertil|irrigat|action|before|now'       then 'action'
  else 'info'
end
where severity = 'info';

alter table advisories drop constraint if exists advisories_severity_check;
alter table advisories add constraint advisories_severity_check
  check (severity in ('info', 'action', 'warning'));

-- ---------------------------------------------------------------------------
-- GROUPS: description  +  GROUP_MEMBERS: member role
-- ---------------------------------------------------------------------------
alter table groups add column if not exists description text not null default '';
alter table group_members add column if not exists role text not null default 'Member';

-- Promote the earliest member of each group to Chairperson.
update group_members gm set role = 'Chairperson'
from (
  select distinct on (group_id) id
  from group_members
  order by group_id, created_at asc
) first
where gm.id = first.id and gm.role = 'Member';

-- ---------------------------------------------------------------------------
-- SUPPLIER INQUIRIES: new table backing SupplierInquiry
-- ---------------------------------------------------------------------------
create table if not exists supplier_inquiries (
  id           uuid primary key default gen_random_uuid(),
  buyer_name   text not null,
  product_id   uuid references products(id) on delete cascade,
  product_name text not null,
  message      text not null,
  phone        text,
  date         timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- OPTIONAL: normalize oil-palm crop vocabulary to match the app enum.
-- The app bridges palm_oil <-> oil-palm already, so this is only cosmetic.
-- Uncomment to standardize the stored value; then drop CROP_APP_TO_DB in api.ts.
-- ---------------------------------------------------------------------------
-- update products         set crop_type  = 'oil-palm' where crop_type  = 'palm_oil';
-- update commodity_prices set crop_type  = 'oil-palm' where crop_type  = 'palm_oil';
-- update advisories       set crop_type  = 'oil-palm' where crop_type  = 'palm_oil';
-- update groups           set crop_focus = 'oil-palm' where crop_focus = 'palm_oil';

commit;

-- ---------------------------------------------------------------------------
-- OPTIONAL (only if Row Level Security is ENABLED on these tables):
-- the app writes with the anon key (register, create advisory/group, inquiries).
-- Demo-grade permissive policies — tighten before production.
-- ---------------------------------------------------------------------------
-- do $$
-- declare t text;
-- begin
--   foreach t in array array['users','products','commodity_prices','weather',
--                            'advisories','groups','group_members','supplier_inquiries']
--   loop
--     execute format('alter table %I enable row level security', t);
--     execute format($f$create policy %I on %I for all to anon using (true) with check (true)$f$,
--                    t || '_anon_all', t);
--   end loop;
-- end $$;
