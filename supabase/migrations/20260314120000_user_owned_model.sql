-- Migration: Replace multi-tenant organization model with simple user-owned model
-- Each row is owned by the user who created it via user_id = auth.uid()

-- ── Step 1: Drop all existing organization-based RLS policies ─────────────────

drop policy if exists organizations_select_policy on public.organizations;
drop policy if exists users_select_policy on public.users;
drop policy if exists users_update_policy on public.users;
drop policy if exists products_access_policy on public.products;
drop policy if exists product_versions_access_policy on public.product_versions;
drop policy if exists suppliers_access_policy on public.suppliers;
drop policy if exists bill_of_materials_access_policy on public.bill_of_materials;
drop policy if exists components_access_policy on public.components;
drop policy if exists documents_access_policy on public.documents;
drop policy if exists change_requests_access_policy on public.change_requests;
drop policy if exists approvals_access_policy on public.approvals;
drop policy if exists quality_issues_access_policy on public.quality_issues;
drop policy if exists projects_access_policy on public.projects;

-- ── Step 2: Add user_id to top-level tables ───────────────────────────────────

alter table public.products
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.suppliers
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.documents
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.change_requests
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.quality_issues
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.projects
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- ── Step 3: Backfill user_id from auth.users for existing seed data ───────────
-- Seeds owned by simra.chandani@bacancy.com — look up their auth.uid() by email

do $$
declare
  seed_user_id uuid;
begin
  select id into seed_user_id
  from auth.users
  where email = 'simra.chandani@bacancy.com'
  limit 1;

  if seed_user_id is null then
    select id into seed_user_id
    from auth.users
    order by created_at asc
    limit 1;
  end if;

  if seed_user_id is not null then
    update public.products   set user_id = seed_user_id where user_id is null;
    update public.suppliers  set user_id = seed_user_id where user_id is null;
    update public.documents  set user_id = seed_user_id where user_id is null;
    update public.change_requests set user_id = seed_user_id where user_id is null;
    update public.quality_issues  set user_id = seed_user_id where user_id is null;
    update public.projects   set user_id = seed_user_id where user_id is null;
  end if;
end;
$$;

-- ── Step 4: Simplify users table — drop organization_id and role ──────────────

alter table public.users drop column if exists organization_id;
alter table public.users drop column if exists role;

-- ── Step 5: Drop old org-specific indexes ────────────────────────────────────

drop index if exists users_organization_id_idx;
drop index if exists products_organization_id_idx;
drop index if exists product_versions_organization_id_idx;
drop index if exists suppliers_organization_id_idx;
drop index if exists bill_of_materials_organization_id_idx;
drop index if exists components_organization_id_idx;
drop index if exists documents_organization_id_idx;
drop index if exists change_requests_organization_id_idx;
drop index if exists approvals_organization_id_idx;
drop index if exists quality_issues_organization_id_idx;
drop index if exists projects_organization_id_idx;
drop index if exists change_requests_open_idx;
drop index if exists quality_issues_open_idx;

-- ── Step 6: Create user_id indexes ───────────────────────────────────────────

create index if not exists products_user_id_idx on public.products (user_id);
create index if not exists suppliers_user_id_idx on public.suppliers (user_id);
create index if not exists documents_user_id_idx on public.documents (user_id);
create index if not exists change_requests_user_id_idx on public.change_requests (user_id);
create index if not exists quality_issues_user_id_idx on public.quality_issues (user_id);
create index if not exists projects_user_id_idx on public.projects (user_id);

create index if not exists change_requests_open_idx
  on public.change_requests (user_id, status)
  where status in ('submitted', 'in_review');

create index if not exists quality_issues_open_idx
  on public.quality_issues (user_id, status)
  where status in ('open', 'investigating');

-- ── Step 7: Drop unique constraints that reference organization_id ────────────

alter table public.products   drop constraint if exists products_organization_sku_key;
alter table public.suppliers  drop constraint if exists suppliers_organization_name_key;

-- Add user-scoped unique constraints
alter table public.products
  add constraint products_user_sku_key unique (user_id, product_sku);

alter table public.suppliers
  add constraint suppliers_user_name_key unique (user_id, supplier_name);

-- ── Step 8: Drop organization_id from child tables ────────────────────────────

alter table public.product_versions drop column if exists organization_id;
alter table public.bill_of_materials drop column if exists organization_id;
alter table public.components drop column if exists organization_id;
alter table public.approvals drop column if exists organization_id;

-- ── Step 9: Drop organization_id from products/suppliers/documents/etc. ───────

alter table public.products        drop column if exists organization_id;
alter table public.suppliers       drop column if exists organization_id;
alter table public.documents       drop column if exists organization_id;
alter table public.change_requests drop column if exists organization_id;
alter table public.quality_issues  drop column if exists organization_id;
alter table public.projects        drop column if exists organization_id;

-- ── Step 10: Drop old org functions ──────────────────────────────────────────

drop function if exists public.current_organization_id();
drop function if exists public.default_organization_id();

-- ── Step 11: Update the auth trigger — simple profile creation ───────────────

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, created_at)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'New User'),
    timezone('utc', now())
  )
  on conflict (id) do update
    set email     = excluded.email,
        full_name = excluded.full_name;

  -- If this database contains legacy organization-scoped rows that could not be
  -- assigned during migration because auth.users was empty, let the first real
  -- signed-in user claim them automatically.
  if exists (select 1 from public.products where user_id is null) then
    update public.products
    set user_id = new.id
    where user_id is null;

    update public.suppliers
    set user_id = new.id
    where user_id is null;

    update public.documents
    set user_id = new.id
    where user_id is null;

    update public.change_requests
    set user_id = new.id
    where user_id is null;

    update public.quality_issues
    set user_id = new.id
    where user_id is null;

    update public.projects
    set user_id = new.id
    where user_id is null;
  end if;

  return new;
end;
$$;

-- ── Step 12: New RLS policies — user_id = auth.uid() ─────────────────────────

-- users: can only read/update own profile
create policy users_select_own
  on public.users for select to authenticated
  using (id = (select auth.uid()));

create policy users_update_own
  on public.users for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- products
create policy products_access_own
  on public.products for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- product_versions (access via parent product)
create policy product_versions_access_own
  on public.product_versions for all to authenticated
  using (
    exists (
      select 1 from public.products
      where products.id = product_versions.product_id
        and products.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.products
      where products.id = product_versions.product_id
        and products.user_id = (select auth.uid())
    )
  );

-- suppliers
create policy suppliers_access_own
  on public.suppliers for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- bill_of_materials (access via parent product)
create policy bill_of_materials_access_own
  on public.bill_of_materials for all to authenticated
  using (
    exists (
      select 1 from public.products
      where products.id = bill_of_materials.product_id
        and products.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.products
      where products.id = bill_of_materials.product_id
        and products.user_id = (select auth.uid())
    )
  );

-- components (access via bill_of_materials → products)
create policy components_access_own
  on public.components for all to authenticated
  using (
    exists (
      select 1 from public.bill_of_materials bom
      join public.products p on p.id = bom.product_id
      where bom.id = components.bom_id
        and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.bill_of_materials bom
      join public.products p on p.id = bom.product_id
      where bom.id = components.bom_id
        and p.user_id = (select auth.uid())
    )
  );

-- documents
create policy documents_access_own
  on public.documents for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- change_requests
create policy change_requests_access_own
  on public.change_requests for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- approvals (access via change_requests)
create policy approvals_access_own
  on public.approvals for all to authenticated
  using (
    exists (
      select 1 from public.change_requests cr
      where cr.id = approvals.change_request_id
        and cr.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.change_requests cr
      where cr.id = approvals.change_request_id
        and cr.user_id = (select auth.uid())
    )
  );

-- quality_issues
create policy quality_issues_access_own
  on public.quality_issues for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- projects
create policy projects_access_own
  on public.projects for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ── Step 13: Disable RLS on organizations (no longer needed) ─────────────────
-- We keep the table but disable policies since it's not used in app anymore

alter table public.organizations disable row level security;
