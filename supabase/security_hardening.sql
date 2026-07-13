-- Security hardening for OjàFarm. Run AFTER auth_rls.sql.
-- Idempotent; safe to re-run.
--
-- Fixes:
--   1. Removes the demo-admin self-provisioning backdoor from the role guard.
--   2. Stops buyer contact details (name/phone/message) in supplier_inquiries
--      from being world-readable, and scopes reads to the owning supplier.

begin;

-- ---------------------------------------------------------------------------
-- 1. ROLE GUARD: drop the hardcoded demo-admin exception.
-- Creating an admin now always requires already being an admin. Bootstrap the
-- first admin manually from the SQL editor (owner bypasses this guard), e.g.:
--   update public.users set role = 'admin' where id = '<auth-user-uuid>';
-- ---------------------------------------------------------------------------
create or replace function public.enforce_role_guard()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  -- Only guard writes that arrive through the API (a client JWT). Migrations
  -- and seeds run by the table owner / service_role bypass this, like RLS.
  if coalesce(auth.role(), '') not in ('anon', 'authenticated') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.role = 'admin' and not public.is_admin() then
      raise exception 'not authorized to create admin accounts';
    end if;
  elsif tg_op = 'UPDATE' then
    if new.role is distinct from old.role and not public.is_admin() then
      raise exception 'not authorized to change role';
    end if;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. SUPPLIER INQUIRIES: contain buyer PII (name, phone, message). Previously
-- readable by anyone holding the (public) anon key, and by every authenticated
-- user regardless of ownership. Restrict reads to the supplier the inquiry is
-- for (via its product) and admins. Buyers may still submit anonymously.
-- ---------------------------------------------------------------------------
revoke select on public.supplier_inquiries from anon;

drop policy if exists inquiries_read on public.supplier_inquiries;
create policy inquiries_read on public.supplier_inquiries for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.products p
      where p.id = supplier_inquiries.product_id
        and p.supplier_id = auth.uid()
    )
  );

commit;
