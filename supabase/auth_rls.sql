-- Supabase Auth + Row Level Security for OjàFarm.
-- Run AFTER align_schema.sql. Idempotent; safe to re-run.
--
-- Model: authentication moves to Supabase Auth (auth.users). The public.users
-- row is the profile, linked by id = auth.uid(). New signups (and the demo
-- accounts, provisioned on first login) insert their profile with that id.
-- Existing seeded users remain as display-only data (no login).
--
-- PREREQUISITE (Dashboard → Authentication → Providers → Email):
--   uncheck "Confirm email"  — synthetic <phone>@ojafarm.local addresses can't
--   receive confirmation mail, and signups must return a session immediately.

begin;

-- Passwords now live in auth.users; the plaintext PIN column is obsolete.
alter table public.users drop column if exists pin;

-- Admin check that bypasses RLS (SECURITY DEFINER) to avoid policy recursion.
create or replace function public.is_admin()
  returns boolean
  language sql
  security definer
  stable
  set search_path = public
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

-- Base privileges; RLS policies below do the actual filtering.
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant insert on public.supplier_inquiries to anon;  -- buyer inquiries may be anonymous
-- The user directory holds contact info (email/phone); require a login to read
-- it so the shipped anon key can't dump PII unauthenticated.
revoke select on public.users from anon;

-- Enable RLS everywhere.
alter table public.users             enable row level security;
alter table public.products          enable row level security;
alter table public.commodity_prices  enable row level security;
alter table public.weather           enable row level security;
alter table public.advisories        enable row level security;
alter table public.groups            enable row level security;
alter table public.group_members     enable row level security;
alter table public.supplier_inquiries enable row level security;

-- USERS: directory readable only to signed-in users; you may write your own
-- row; admins write any. Role changes are further gated by the trigger below.
drop policy if exists users_read       on public.users;
drop policy if exists users_insert_self on public.users;
drop policy if exists users_update_own on public.users;
create policy users_read        on public.users for select to authenticated using (true);
create policy users_insert_self on public.users for insert with check (id = auth.uid());
create policy users_update_own  on public.users for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Prevent privilege escalation: the row-ownership check above would otherwise
-- let a user set their own role to 'admin'. Only an existing admin (or the
-- seeded demo-admin identity, matched on its non-spoofable JWT email) may
-- create or assign the admin role, and non-admins may not change role at all.
create or replace function public.enforce_role_guard()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  if new.role = 'admin'
     and not public.is_admin()
     and coalesce(auth.jwt() ->> 'email', '') <> '7000000000@ojafarm.local' then
    raise exception 'not authorized to assign admin role';
  end if;
  if tg_op = 'UPDATE'
     and new.role is distinct from old.role
     and not public.is_admin() then
    raise exception 'not authorized to change role';
  end if;
  return new;
end;
$$;

drop trigger if exists users_role_guard on public.users;
create trigger users_role_guard
  before insert or update on public.users
  for each row execute function public.enforce_role_guard();

-- PRODUCTS: public catalog; a supplier manages their own listings; admins any.
drop policy if exists products_read  on public.products;
drop policy if exists products_write on public.products;
create policy products_read  on public.products for select using (true);
create policy products_write on public.products for all
  using (supplier_id = auth.uid() or public.is_admin())
  with check (supplier_id = auth.uid() or public.is_admin());

-- REFERENCE DATA (prices, weather, advisories): public read, admin write.
drop policy if exists prices_read  on public.commodity_prices;
drop policy if exists prices_write on public.commodity_prices;
create policy prices_read  on public.commodity_prices for select using (true);
create policy prices_write on public.commodity_prices for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists weather_read  on public.weather;
drop policy if exists weather_write on public.weather;
create policy weather_read  on public.weather for select using (true);
create policy weather_write on public.weather for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists advisories_read  on public.advisories;
drop policy if exists advisories_write on public.advisories;
create policy advisories_read  on public.advisories for select using (true);
create policy advisories_write on public.advisories for all
  using (public.is_admin()) with check (public.is_admin());

-- GROUPS: public read; any authenticated user creates; admins edit/delete.
drop policy if exists groups_read   on public.groups;
drop policy if exists groups_insert on public.groups;
drop policy if exists groups_modify on public.groups;
create policy groups_read   on public.groups for select using (true);
create policy groups_insert on public.groups for insert to authenticated with check (true);
create policy groups_modify on public.groups for update
  using (public.is_admin()) with check (public.is_admin());

-- GROUP MEMBERS: public read; you join yourself; admins manage anyone.
drop policy if exists members_read   on public.group_members;
drop policy if exists members_insert on public.group_members;
drop policy if exists members_delete on public.group_members;
create policy members_read   on public.group_members for select using (true);
create policy members_insert on public.group_members for insert
  with check (user_id = auth.uid() or public.is_admin());
create policy members_delete on public.group_members for delete
  using (user_id = auth.uid() or public.is_admin());

-- SUPPLIER INQUIRIES: public read (suppliers view); anyone may submit.
drop policy if exists inquiries_read   on public.supplier_inquiries;
drop policy if exists inquiries_insert on public.supplier_inquiries;
create policy inquiries_read   on public.supplier_inquiries for select using (true);
create policy inquiries_insert on public.supplier_inquiries for insert with check (true);

commit;
