create extension if not exists pgcrypto;

create type public.user_role as enum (
  'admin',
  'product_manager',
  'hardware_engineer',
  'manufacturing_engineer',
  'quality_engineer',
  'supplier_manager',
  'operations_manager'
);

create type public.lifecycle_stage as enum (
  'concept',
  'design',
  'prototype',
  'testing',
  'manufacturing',
  'launch',
  'sustaining'
);

create type public.document_type as enum (
  'cad',
  'specification',
  'test_report',
  'compliance_certificate',
  'assembly_instruction'
);

create type public.supplier_status as enum (
  'active',
  'onboarding',
  'preferred',
  'inactive'
);

create type public.change_request_status as enum (
  'submitted',
  'in_review',
  'approved',
  'implemented',
  'rejected'
);

create type public.approval_status as enum (
  'pending',
  'approved',
  'rejected'
);

create type public.quality_severity as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type public.quality_status as enum (
  'open',
  'investigating',
  'resolved',
  'closed'
);

create type public.project_status as enum (
  'concept',
  'design',
  'prototype',
  'testing',
  'manufacturing',
  'launch',
  'complete'
);

create type public.component_type as enum (
  'module',
  'electrical',
  'mechanical',
  'sensor',
  'packaging',
  'firmware'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.users (
  id uuid primary key,
  organization_id uuid not null references public.organizations(id) on delete restrict,
  email text not null unique,
  full_name text not null,
  role public.user_role not null default 'hardware_engineer',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_name text not null,
  product_sku text not null,
  product_category text not null,
  description text,
  lifecycle_stage public.lifecycle_stage not null default 'concept',
  current_version_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint products_organization_sku_key unique (organization_id, product_sku)
);

create table public.product_versions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  version_code text not null,
  summary text,
  is_current boolean not null default false,
  created_by uuid references public.users(id) on delete set null,
  released_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint product_versions_product_version_key unique (product_id, version_code)
);

alter table public.products
  add constraint products_current_version_id_fkey
  foreign key (current_version_id) references public.product_versions(id) on delete set null;

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  supplier_name text not null,
  contact_email text not null,
  country text not null,
  status public.supplier_status not null default 'active',
  performance_score numeric(5, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint suppliers_organization_name_key unique (organization_id, supplier_name)
);

create table public.bill_of_materials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  product_version_id uuid references public.product_versions(id) on delete set null,
  bom_version text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.components (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  bom_id uuid not null references public.bill_of_materials(id) on delete cascade,
  parent_component_id uuid references public.components(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  component_name text not null,
  component_sku text not null,
  component_type public.component_type not null,
  manufacturer text not null,
  quantity numeric(12, 2) not null check (quantity > 0),
  unit_cost numeric(12, 2) not null check (unit_cost >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  document_name text not null,
  document_type public.document_type not null,
  file_url text,
  storage_path text not null,
  version integer not null default 1 check (version > 0),
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.change_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  description text not null,
  status public.change_request_status not null default 'submitted',
  requested_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  change_request_id uuid not null references public.change_requests(id) on delete cascade,
  approver_id uuid references public.users(id) on delete set null,
  status public.approval_status not null default 'pending',
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.quality_issues (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  issue_title text not null,
  description text not null,
  severity public.quality_severity not null,
  status public.quality_status not null default 'open',
  reported_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  project_name text not null,
  deadline date,
  status public.project_status not null default 'concept',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index product_versions_current_idx
  on public.product_versions (product_id)
  where is_current = true;

create index users_organization_id_idx on public.users (organization_id);
create index products_organization_id_idx on public.products (organization_id);
create index product_versions_organization_id_idx on public.product_versions (organization_id);
create index product_versions_product_id_idx on public.product_versions (product_id);
create index suppliers_organization_id_idx on public.suppliers (organization_id);
create index bill_of_materials_product_id_idx on public.bill_of_materials (product_id);
create index bill_of_materials_organization_id_idx on public.bill_of_materials (organization_id);
create index components_bom_id_idx on public.components (bom_id);
create index components_parent_component_id_idx on public.components (parent_component_id);
create index components_supplier_id_idx on public.components (supplier_id);
create index components_organization_id_idx on public.components (organization_id);
create index documents_product_id_idx on public.documents (product_id);
create index documents_organization_id_idx on public.documents (organization_id);
create index change_requests_product_id_idx on public.change_requests (product_id);
create index change_requests_organization_id_idx on public.change_requests (organization_id);
create index approvals_change_request_id_idx on public.approvals (change_request_id);
create index approvals_organization_id_idx on public.approvals (organization_id);
create index quality_issues_product_id_idx on public.quality_issues (product_id);
create index quality_issues_organization_id_idx on public.quality_issues (organization_id);
create index projects_product_id_idx on public.projects (product_id);
create index projects_organization_id_idx on public.projects (organization_id);

create index change_requests_open_idx
  on public.change_requests (organization_id, status)
  where status in ('submitted', 'in_review');

create index quality_issues_open_idx
  on public.quality_issues (organization_id, status)
  where status in ('open', 'investigating');

create trigger set_updated_at_on_organizations
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_users
before update on public.users
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_products
before update on public.products
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_product_versions
before update on public.product_versions
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_suppliers
before update on public.suppliers
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_bill_of_materials
before update on public.bill_of_materials
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_components
before update on public.components
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_documents
before update on public.documents
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_change_requests
before update on public.change_requests
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_approvals
before update on public.approvals
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_quality_issues
before update on public.quality_issues
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_projects
before update on public.projects
for each row execute function public.set_updated_at();

create or replace function public.default_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.organizations
  order by created_at asc
  limit 1;
$$;

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.users
  where id = (select auth.uid());
$$;

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_organization_id uuid;
  resolved_role public.user_role;
begin
  resolved_organization_id := coalesce(
    nullif(new.raw_user_meta_data ->> 'organization_id', '')::uuid,
    public.default_organization_id()
  );

  resolved_role := coalesce(
    nullif(new.raw_user_meta_data ->> 'role', '')::public.user_role,
    'hardware_engineer'
  );

  insert into public.users (
    id,
    organization_id,
    email,
    full_name,
    role
  )
  values (
    new.id,
    resolved_organization_id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'New Team Member'),
    resolved_role
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.product_versions enable row level security;
alter table public.suppliers enable row level security;
alter table public.bill_of_materials enable row level security;
alter table public.components enable row level security;
alter table public.documents enable row level security;
alter table public.change_requests enable row level security;
alter table public.approvals enable row level security;
alter table public.quality_issues enable row level security;
alter table public.projects enable row level security;

create policy organizations_select_policy
on public.organizations
for select
to authenticated
using (id = (select public.current_organization_id()));

create policy users_select_policy
on public.users
for select
to authenticated
using (organization_id = (select public.current_organization_id()));

create policy users_update_policy
on public.users
for update
to authenticated
using (id = (select auth.uid()))
with check (
  id = (select auth.uid())
  and organization_id = (select public.current_organization_id())
);

create policy products_access_policy
on public.products
for all
to authenticated
using (organization_id = (select public.current_organization_id()))
with check (organization_id = (select public.current_organization_id()));

create policy product_versions_access_policy
on public.product_versions
for all
to authenticated
using (organization_id = (select public.current_organization_id()))
with check (organization_id = (select public.current_organization_id()));

create policy suppliers_access_policy
on public.suppliers
for all
to authenticated
using (organization_id = (select public.current_organization_id()))
with check (organization_id = (select public.current_organization_id()));

create policy bill_of_materials_access_policy
on public.bill_of_materials
for all
to authenticated
using (organization_id = (select public.current_organization_id()))
with check (organization_id = (select public.current_organization_id()));

create policy components_access_policy
on public.components
for all
to authenticated
using (organization_id = (select public.current_organization_id()))
with check (organization_id = (select public.current_organization_id()));

create policy documents_access_policy
on public.documents
for all
to authenticated
using (organization_id = (select public.current_organization_id()))
with check (organization_id = (select public.current_organization_id()));

create policy change_requests_access_policy
on public.change_requests
for all
to authenticated
using (organization_id = (select public.current_organization_id()))
with check (organization_id = (select public.current_organization_id()));

create policy approvals_access_policy
on public.approvals
for all
to authenticated
using (organization_id = (select public.current_organization_id()))
with check (organization_id = (select public.current_organization_id()));

create policy quality_issues_access_policy
on public.quality_issues
for all
to authenticated
using (organization_id = (select public.current_organization_id()))
with check (organization_id = (select public.current_organization_id()));

create policy projects_access_policy
on public.projects
for all
to authenticated
using (organization_id = (select public.current_organization_id()))
with check (organization_id = (select public.current_organization_id()));

insert into storage.buckets (id, name, public)
values ('product-documents', 'product-documents', false)
on conflict (id) do nothing;

create policy storage_objects_select_policy
on storage.objects
for select
to authenticated
using (bucket_id = 'product-documents');

create policy storage_objects_insert_policy
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-documents');

create policy storage_objects_update_policy
on storage.objects
for update
to authenticated
using (bucket_id = 'product-documents')
with check (bucket_id = 'product-documents');

create policy storage_objects_delete_policy
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-documents');

