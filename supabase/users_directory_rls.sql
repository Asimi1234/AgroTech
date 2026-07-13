-- Tighten public.users read access. Run AFTER auth_rls.sql. Idempotent.
--
-- Problem: `users_read to authenticated using (true)` let ANY logged-in account
-- read every user's row (name, phone, email, region). With open signup, an
-- attacker could register once and harvest the entire user base's contact info.
--
-- The app only ever surfaces other users' rows in three bounded ways:
--   • supplier contacts on the marketplace   → role = 'supplier'
--   • cooperative member lists                → user is a member of some group
--   • the admin console                        → is_admin()
-- plus a user reading their own row. This policy allows exactly those and no
-- more, so a plain farmer who is neither a supplier nor a group member is no
-- longer readable by other accounts. No application changes are required — the
-- existing select('*') / users(*) reads all fall inside these cases.

begin;

drop policy if exists users_read on public.users;
create policy users_read on public.users for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
    or role = 'supplier'
    or exists (
      select 1 from public.group_members gm
      where gm.user_id = users.id
    )
  );

commit;
