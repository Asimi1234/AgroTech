-- Commodity reference data: the source of truth for the commodity list, display
-- names, and units (previously hardcoded in the app's mock layer). Admin-managed
-- via the dashboard; RLS-gated. Run AFTER auth_rls.sql. Idempotent.
--
-- `slug` matches commodity_prices.crop_type so price rows join to a commodity.

begin;

create table if not exists public.commodities (
  slug       text primary key,
  name       text not null,
  unit       text not null default 'per kg',
  sort       integer not null default 0,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.commodities enable row level security;

grant select on public.commodities to anon, authenticated;
grant insert, update, delete on public.commodities to authenticated;

drop policy if exists commodities_read  on public.commodities;
drop policy if exists commodities_write on public.commodities;
create policy commodities_read  on public.commodities for select using (true);
create policy commodities_write on public.commodities for all
  using (public.is_admin()) with check (public.is_admin());

-- Seed the commodities already in use (slug = commodity_prices.crop_type).
insert into public.commodities (slug, name, unit, sort) values
  ('maize',    'Maize (dry grain)',     'per kg',    1),
  ('cassava',  'Cassava (fresh tuber)', 'per kg',    2),
  ('palm_oil', 'Palm Oil (crude)',      'per litre', 3),
  ('rice',     'Paddy Rice',            'per kg',    4)
on conflict (slug) do nothing;

commit;
