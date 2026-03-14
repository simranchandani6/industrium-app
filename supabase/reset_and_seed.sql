-- Industrium standalone reset + bootstrap + seed
-- WARNING: this is destructive.
--
-- This script:
-- 1. deletes auth users/sessions
-- 2. drops and recreates the current public schema used by the app
-- 3. recreates RLS, storage policies, and the auth profile trigger
-- 4. seeds the demo user and hardware products dataset
--
-- Supabase blocks direct SQL deletion from storage.objects.
-- If you need the `product-documents` bucket emptied too, clear it separately
-- via the Storage API or the Supabase dashboard.

begin;

create extension if not exists pgcrypto;

delete from auth.sessions;
delete from auth.refresh_tokens;
delete from auth.identities;
delete from auth.users;

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.notifications cascade;
drop table if exists public.customer_feedback cascade;
drop table if exists public.product_risks cascade;
drop table if exists public.compliance_records cascade;
drop table if exists public.manufacturing_process_steps cascade;
drop table if exists public.approvals cascade;
drop table if exists public.change_requests cascade;
drop table if exists public.quality_issues cascade;
drop table if exists public.documents cascade;
drop table if exists public.components cascade;
drop table if exists public.bill_of_materials cascade;
drop table if exists public.projects cascade;
drop table if exists public.product_versions cascade;
drop table if exists public.suppliers cascade;
drop table if exists public.products cascade;
drop table if exists public.users cascade;
drop table if exists public.organizations cascade;

drop function if exists public.handle_auth_user_created() cascade;
drop function if exists public.set_updated_at() cascade;
drop function if exists public.current_organization_id() cascade;
drop function if exists public.default_organization_id() cascade;

drop type if exists public.notification_level cascade;
drop type if exists public.feedback_channel cascade;
drop type if exists public.risk_status cascade;
drop type if exists public.compliance_status cascade;
drop type if exists public.component_type cascade;
drop type if exists public.project_status cascade;
drop type if exists public.quality_status cascade;
drop type if exists public.quality_severity cascade;
drop type if exists public.approval_status cascade;
drop type if exists public.change_request_status cascade;
drop type if exists public.supplier_status cascade;
drop type if exists public.document_type cascade;
drop type if exists public.lifecycle_stage cascade;
drop type if exists public.user_role cascade;

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

create type public.compliance_status as enum (
  'pending',
  'valid',
  'needs_review',
  'expired'
);

create type public.risk_status as enum (
  'identified',
  'monitoring',
  'mitigated',
  'closed'
);

create type public.feedback_channel as enum (
  'email',
  'support_ticket',
  'sales_call',
  'field_visit'
);

create type public.notification_level as enum (
  'info',
  'success',
  'warning'
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

create table public.users (
  id uuid primary key,
  email text not null unique,
  full_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  product_sku text not null,
  product_category text not null,
  description text,
  lifecycle_stage public.lifecycle_stage not null default 'concept',
  current_version_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint products_user_sku_key unique (user_id, product_sku)
);

create table public.product_versions (
  id uuid primary key default gen_random_uuid(),
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
  user_id uuid not null references auth.users(id) on delete cascade,
  supplier_name text not null,
  contact_email text not null,
  country text not null,
  status public.supplier_status not null default 'active',
  performance_score numeric(5, 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint suppliers_user_name_key unique (user_id, supplier_name)
);

create table public.bill_of_materials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  product_version_id uuid references public.product_versions(id) on delete set null,
  bom_version text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.components (
  id uuid primary key default gen_random_uuid(),
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
  user_id uuid not null references auth.users(id) on delete cascade,
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
  user_id uuid not null references auth.users(id) on delete cascade,
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
  change_request_id uuid not null references public.change_requests(id) on delete cascade,
  approver_id uuid references public.users(id) on delete set null,
  status public.approval_status not null default 'pending',
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.quality_issues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  project_name text not null,
  deadline date,
  status public.project_status not null default 'concept',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.manufacturing_process_steps (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sequence_number integer not null check (sequence_number > 0),
  step_name text not null,
  workstation text,
  instructions text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint manufacturing_process_steps_product_sequence_key unique (product_id, sequence_number)
);

create table public.compliance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  compliance_name text not null,
  authority text,
  status public.compliance_status not null default 'pending',
  due_date date,
  validated_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.product_risks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  risk_title text not null,
  description text not null,
  severity public.quality_severity not null default 'medium',
  status public.risk_status not null default 'identified',
  mitigation_plan text,
  owner_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.customer_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  customer_name text not null,
  channel public.feedback_channel not null default 'email',
  rating integer check (rating between 1 and 5),
  feedback_text text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  title text not null,
  message text not null,
  level public.notification_level not null default 'info',
  related_path text,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index product_versions_current_idx
  on public.product_versions (product_id)
  where is_current = true;

create index products_user_id_idx on public.products (user_id);
create index product_versions_product_id_idx on public.product_versions (product_id);
create index suppliers_user_id_idx on public.suppliers (user_id);
create index bill_of_materials_product_id_idx on public.bill_of_materials (product_id);
create index components_bom_id_idx on public.components (bom_id);
create index components_parent_component_id_idx on public.components (parent_component_id);
create index components_supplier_id_idx on public.components (supplier_id);
create index documents_product_id_idx on public.documents (product_id);
create index documents_user_id_idx on public.documents (user_id);
create index change_requests_product_id_idx on public.change_requests (product_id);
create index change_requests_user_id_idx on public.change_requests (user_id);
create index approvals_change_request_id_idx on public.approvals (change_request_id);
create index quality_issues_product_id_idx on public.quality_issues (product_id);
create index quality_issues_user_id_idx on public.quality_issues (user_id);
create index projects_product_id_idx on public.projects (product_id);
create index projects_user_id_idx on public.projects (user_id);
create index manufacturing_process_steps_product_id_idx on public.manufacturing_process_steps (product_id, sequence_number);
create index compliance_records_user_id_idx on public.compliance_records (user_id);
create index compliance_records_product_id_idx on public.compliance_records (product_id);
create index compliance_records_due_date_idx on public.compliance_records (user_id, due_date);
create index product_risks_user_id_idx on public.product_risks (user_id);
create index product_risks_product_id_idx on public.product_risks (product_id);
create index customer_feedback_user_id_idx on public.customer_feedback (user_id);
create index customer_feedback_product_id_idx on public.customer_feedback (product_id);
create index notifications_user_id_idx on public.notifications (user_id, created_at desc);

create index change_requests_open_idx
  on public.change_requests (user_id, status)
  where status in ('submitted', 'in_review');

create index quality_issues_open_idx
  on public.quality_issues (user_id, status)
  where status in ('open', 'investigating');

create index product_risks_open_idx
  on public.product_risks (user_id, status)
  where status in ('identified', 'monitoring');

create index notifications_unread_idx
  on public.notifications (user_id, created_at desc)
  where is_read = false;

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

create trigger set_updated_at_on_manufacturing_process_steps
before update on public.manufacturing_process_steps
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_compliance_records
before update on public.compliance_records
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_product_risks
before update on public.product_risks
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_customer_feedback
before update on public.customer_feedback
for each row execute function public.set_updated_at();

create trigger set_updated_at_on_notifications
before update on public.notifications
for each row execute function public.set_updated_at();

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, created_at, updated_at)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'New User'),
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

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
alter table public.manufacturing_process_steps enable row level security;
alter table public.compliance_records enable row level security;
alter table public.product_risks enable row level security;
alter table public.customer_feedback enable row level security;
alter table public.notifications enable row level security;

create policy users_select_own
  on public.users for select to authenticated
  using (id = (select auth.uid()));

create policy users_update_own
  on public.users for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy products_access_own
  on public.products for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy product_versions_access_own
  on public.product_versions for all to authenticated
  using (
    exists (
      select 1
      from public.products
      where products.id = product_versions.product_id
        and products.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.products
      where products.id = product_versions.product_id
        and products.user_id = (select auth.uid())
    )
  );

create policy suppliers_access_own
  on public.suppliers for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy bill_of_materials_access_own
  on public.bill_of_materials for all to authenticated
  using (
    exists (
      select 1
      from public.products
      where products.id = bill_of_materials.product_id
        and products.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.products
      where products.id = bill_of_materials.product_id
        and products.user_id = (select auth.uid())
    )
  );

create policy components_access_own
  on public.components for all to authenticated
  using (
    exists (
      select 1
      from public.bill_of_materials bom
      join public.products p on p.id = bom.product_id
      where bom.id = components.bom_id
        and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.bill_of_materials bom
      join public.products p on p.id = bom.product_id
      where bom.id = components.bom_id
        and p.user_id = (select auth.uid())
    )
  );

create policy documents_access_own
  on public.documents for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy change_requests_access_own
  on public.change_requests for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy approvals_access_own
  on public.approvals for all to authenticated
  using (
    exists (
      select 1
      from public.change_requests cr
      where cr.id = approvals.change_request_id
        and cr.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.change_requests cr
      where cr.id = approvals.change_request_id
        and cr.user_id = (select auth.uid())
    )
  );

create policy quality_issues_access_own
  on public.quality_issues for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy projects_access_own
  on public.projects for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy manufacturing_process_steps_access_own
  on public.manufacturing_process_steps for all to authenticated
  using (
    exists (
      select 1
      from public.products
      where products.id = manufacturing_process_steps.product_id
        and products.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.products
      where products.id = manufacturing_process_steps.product_id
        and products.user_id = (select auth.uid())
    )
  );

create policy compliance_records_access_own
  on public.compliance_records for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy product_risks_access_own
  on public.product_risks for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy customer_feedback_access_own
  on public.customer_feedback for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy notifications_access_own
  on public.notifications for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public)
values ('product-documents', 'product-documents', false)
on conflict (id) do nothing;

drop policy if exists storage_objects_select_policy on storage.objects;
drop policy if exists storage_objects_insert_policy on storage.objects;
drop policy if exists storage_objects_update_policy on storage.objects;
drop policy if exists storage_objects_delete_policy on storage.objects;
drop policy if exists product_documents_select_own on storage.objects;
drop policy if exists product_documents_insert_own on storage.objects;
drop policy if exists product_documents_update_own on storage.objects;
drop policy if exists product_documents_delete_own on storage.objects;

create policy product_documents_select_own
  on storage.objects for select to authenticated
  using (
    bucket_id = 'product-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy product_documents_insert_own
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy product_documents_update_own
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'product-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy product_documents_delete_own
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

do $$
declare
  demo_user_id constant uuid := 'aaaaaaaa-1111-4111-8111-111111111111';
  demo_email constant text := 'simra.chandani@bacancy.com';
  seeded_at constant timestamptz := timezone('utc', now());
begin
  insert into auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    demo_user_id,
    'authenticated',
    'authenticated',
    demo_email,
    crypt('DemoPass123!', gen_salt('bf')),
    seeded_at,
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', 'Simran Chandani'),
    seeded_at,
    seeded_at
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at,
    last_sign_in_at
  )
  values (
    demo_user_id,
    demo_user_id,
    jsonb_build_object('sub', demo_user_id::text, 'email', demo_email),
    'email',
    demo_email,
    seeded_at,
    seeded_at,
    seeded_at
  );
end;
$$;

insert into public.products (
  id,
  user_id,
  product_name,
  product_sku,
  product_category,
  description,
  lifecycle_stage,
  created_at,
  updated_at
)
values
  (
    '33333333-3333-3333-3333-333333333331',
    'aaaaaaaa-1111-4111-8111-111111111111',
    'AeroFrame Structural Bracket',
    'AFB-1001',
    'Aerospace',
    'High-strength titanium structural bracket for airframe assembly. Currently in fatigue validation and load cycle testing per AS9100 requirements.',
    'testing',
    timezone('utc', now()) - interval '60 days',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    'aaaaaaaa-1111-4111-8111-111111111111',
    'HydroValve Pro Series',
    'HVP-2204',
    'Industrial',
    'High-pressure hydraulic control valve for industrial automation systems. Rated to 350 bar with modular actuator design for OEM integration.',
    'prototype',
    timezone('utc', now()) - interval '45 days',
    timezone('utc', now()) - interval '4 days'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'aaaaaaaa-1111-4111-8111-111111111111',
    'MediPump Infusion Module',
    'MPM-3050',
    'Medical Devices',
    'Precision infusion pump module for ambulatory drug delivery. IEC 60601 compliant design under review. Mechanical packaging finalization in progress.',
    'design',
    timezone('utc', now()) - interval '30 days',
    timezone('utc', now()) - interval '3 days'
  );

insert into public.product_versions (
  id,
  product_id,
  version_code,
  summary,
  is_current,
  created_by,
  released_at,
  created_at,
  updated_at
)
values
  (
    '44444444-4444-4444-4444-444444444440',
    '33333333-3333-3333-3333-333333333331',
    'v1.2',
    'Baseline fatigue build prior to wall thickness revision and rib reinforcement.',
    false,
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '48 days',
    timezone('utc', now()) - interval '48 days',
    timezone('utc', now()) - interval '48 days'
  ),
  (
    '44444444-4444-4444-4444-444444444441',
    '33333333-3333-3333-3333-333333333331',
    'v1.3',
    'Revised rib geometry and 3.5mm wall thickness candidate for DVT validation.',
    true,
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '21 days',
    timezone('utc', now()) - interval '21 days',
    timezone('utc', now()) - interval '21 days'
  ),
  (
    '44444444-4444-4444-4444-444444444442',
    '33333333-3333-3333-3333-333333333332',
    'v0.9',
    'Pilot prototype with PTFE seal upgrade and updated actuator port geometry.',
    true,
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '12 days',
    timezone('utc', now()) - interval '12 days',
    timezone('utc', now()) - interval '12 days'
  ),
  (
    '44444444-4444-4444-4444-444444444443',
    '33333333-3333-3333-3333-333333333333',
    'v0.7',
    'Initial packaging layout with peristaltic pump assembly and housing shell fit check.',
    true,
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '7 days',
    timezone('utc', now()) - interval '7 days',
    timezone('utc', now()) - interval '7 days'
  );

update public.products
set current_version_id = case id
  when '33333333-3333-3333-3333-333333333331' then '44444444-4444-4444-4444-444444444441'
  when '33333333-3333-3333-3333-333333333332' then '44444444-4444-4444-4444-444444444442'
  when '33333333-3333-3333-3333-333333333333' then '44444444-4444-4444-4444-444444444443'
  else current_version_id
end
where id in (
  '33333333-3333-3333-3333-333333333331',
  '33333333-3333-3333-3333-333333333332',
  '33333333-3333-3333-3333-333333333333'
);

insert into public.suppliers (
  id,
  user_id,
  supplier_name,
  contact_email,
  country,
  status,
  performance_score,
  created_at,
  updated_at
)
values
  (
    '55555555-5555-5555-5555-555555555551',
    'aaaaaaaa-1111-4111-8111-111111111111',
    'Precision Metals Group',
    'sourcing@precisionmetals.com',
    'Germany',
    'preferred',
    94.50,
    timezone('utc', now()) - interval '50 days',
    timezone('utc', now()) - interval '5 days'
  ),
  (
    '55555555-5555-5555-5555-555555555552',
    'aaaaaaaa-1111-4111-8111-111111111111',
    'FluidPower Systems Ltd',
    'accounts@fluidpowersystems.com',
    'United States',
    'active',
    91.20,
    timezone('utc', now()) - interval '50 days',
    timezone('utc', now()) - interval '4 days'
  ),
  (
    '55555555-5555-5555-5555-555555555553',
    'aaaaaaaa-1111-4111-8111-111111111111',
    'MedTech Materials Co',
    'supply@medtechmaterials.eu',
    'Netherlands',
    'preferred',
    96.80,
    timezone('utc', now()) - interval '50 days',
    timezone('utc', now()) - interval '3 days'
  );

insert into public.bill_of_materials (
  id,
  product_id,
  product_version_id,
  bom_version,
  created_at,
  updated_at
)
values
  (
    '66666666-6666-6666-6666-666666666660',
    '33333333-3333-3333-3333-333333333331',
    '44444444-4444-4444-4444-444444444440',
    'BOM-v1.2',
    timezone('utc', now()) - interval '48 days',
    timezone('utc', now()) - interval '48 days'
  ),
  (
    '66666666-6666-6666-6666-666666666661',
    '33333333-3333-3333-3333-333333333331',
    '44444444-4444-4444-4444-444444444441',
    'BOM-v1.3',
    timezone('utc', now()) - interval '21 days',
    timezone('utc', now()) - interval '21 days'
  ),
  (
    '66666666-6666-6666-6666-666666666662',
    '33333333-3333-3333-3333-333333333332',
    '44444444-4444-4444-4444-444444444442',
    'BOM-v0.9',
    timezone('utc', now()) - interval '12 days',
    timezone('utc', now()) - interval '12 days'
  ),
  (
    '66666666-6666-6666-6666-666666666663',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444443',
    'BOM-v0.7',
    timezone('utc', now()) - interval '7 days',
    timezone('utc', now()) - interval '7 days'
  );

insert into public.components (
  id,
  bom_id,
  parent_component_id,
  supplier_id,
  component_name,
  component_sku,
  component_type,
  manufacturer,
  quantity,
  unit_cost,
  created_at,
  updated_at
)
values
  ('77777777-7777-7777-7777-777777777770','66666666-6666-6666-6666-666666666660',null,'55555555-5555-5555-5555-555555555551','Ti-6Al-4V Billet','CMP-TI-00','module','Precision Metals Group',1,142.00,timezone('utc', now()) - interval '48 days',timezone('utc', now()) - interval '48 days'),
  ('77777777-7777-7777-7777-777777777771','66666666-6666-6666-6666-666666666661',null,'55555555-5555-5555-5555-555555555551','Ti-6Al-4V Billet','CMP-TI-01','module','Precision Metals Group',1,148.50,timezone('utc', now()) - interval '21 days',timezone('utc', now()) - interval '21 days'),
  ('77777777-7777-7777-7777-777777777772','66666666-6666-6666-6666-666666666661',null,'55555555-5555-5555-5555-555555555551','Fastener Kit','CMP-FKT-02','mechanical','Precision Metals Group',1,18.40,timezone('utc', now()) - interval '21 days',timezone('utc', now()) - interval '21 days'),
  ('77777777-7777-7777-7777-777777777773','66666666-6666-6666-6666-666666666661','77777777-7777-7777-7777-777777777772','55555555-5555-5555-5555-555555555551','M8 Titanium Bolts','CMP-M8B-03','mechanical','Precision Metals Group',8,1.85,timezone('utc', now()) - interval '21 days',timezone('utc', now()) - interval '21 days'),
  ('77777777-7777-7777-7777-777777777774','66666666-6666-6666-6666-666666666661','77777777-7777-7777-7777-777777777772','55555555-5555-5555-5555-555555555551','Aerospace Lockwashers','CMP-ALW-04','mechanical','Precision Metals Group',8,0.60,timezone('utc', now()) - interval '21 days',timezone('utc', now()) - interval '21 days'),
  ('77777777-7777-7777-7777-777777777775','66666666-6666-6666-6666-666666666661',null,'55555555-5555-5555-5555-555555555551','NDT Inspection Jig','CMP-NDT-05','module','Precision Metals Group',1,74.00,timezone('utc', now()) - interval '21 days',timezone('utc', now()) - interval '21 days'),
  ('77777777-7777-7777-7777-777777777776','66666666-6666-6666-6666-666666666662',null,'55555555-5555-5555-5555-555555555552','Valve Body Assembly','CMP-VBA-06','module','FluidPower Systems Ltd',1,84.90,timezone('utc', now()) - interval '12 days',timezone('utc', now()) - interval '12 days'),
  ('77777777-7777-7777-7777-777777777777','66666666-6666-6666-6666-666666666662','77777777-7777-7777-7777-777777777776','55555555-5555-5555-5555-555555555552','Stainless Steel Housing','CMP-SSH-07','mechanical','FluidPower Systems Ltd',1,32.50,timezone('utc', now()) - interval '12 days',timezone('utc', now()) - interval '12 days'),
  ('77777777-7777-7777-7777-777777777778','66666666-6666-6666-6666-666666666662','77777777-7777-7777-7777-777777777776','55555555-5555-5555-5555-555555555552','PTFE Actuator Seal Kit','CMP-ASK-08','mechanical','FluidPower Systems Ltd',2,9.80,timezone('utc', now()) - interval '12 days',timezone('utc', now()) - interval '12 days'),
  ('77777777-7777-7777-7777-777777777779','66666666-6666-6666-6666-666666666662',null,'55555555-5555-5555-5555-555555555552','Control Interface Board','CMP-CIB-09','module','FluidPower Systems Ltd',1,46.75,timezone('utc', now()) - interval '12 days',timezone('utc', now()) - interval '12 days'),
  ('77777777-7777-7777-7777-777777777780','66666666-6666-6666-6666-666666666662',null,'55555555-5555-5555-5555-555555555552','Pressure Sensor','CMP-PSR-10','sensor','FluidPower Systems Ltd',1,22.40,timezone('utc', now()) - interval '12 days',timezone('utc', now()) - interval '12 days'),
  ('77777777-7777-7777-7777-777777777781','66666666-6666-6666-6666-666666666663',null,'55555555-5555-5555-5555-555555555553','Peristaltic Pump Assembly','CMP-PPA-11','module','MedTech Materials Co',1,68.20,timezone('utc', now()) - interval '7 days',timezone('utc', now()) - interval '7 days'),
  ('77777777-7777-7777-7777-777777777782','66666666-6666-6666-6666-666666666663',null,'55555555-5555-5555-5555-555555555553','Flow Rate Sensor','CMP-FRS-12','sensor','MedTech Materials Co',1,34.50,timezone('utc', now()) - interval '7 days',timezone('utc', now()) - interval '7 days'),
  ('77777777-7777-7777-7777-777777777783','66666666-6666-6666-6666-666666666663',null,'55555555-5555-5555-5555-555555555553','Stepper Drive Motor','CMP-SDM-13','module','MedTech Materials Co',1,29.90,timezone('utc', now()) - interval '7 days',timezone('utc', now()) - interval '7 days'),
  ('77777777-7777-7777-7777-777777777784','66666666-6666-6666-6666-666666666663',null,'55555555-5555-5555-5555-555555555553','Housing Shell','CMP-HSH-14','mechanical','MedTech Materials Co',1,14.60,timezone('utc', now()) - interval '7 days',timezone('utc', now()) - interval '7 days');

insert into public.documents (
  id, user_id, product_id, document_name, document_type, file_url, storage_path, version, uploaded_by, created_at, updated_at
)
values
  ('88888888-8888-8888-8888-888888888881','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333331','aeroframe_fatigue_test_report_v1.3.pdf','test_report',null,'aaaaaaaa-1111-4111-8111-111111111111/33333333-3333-3333-3333-333333333331/aeroframe_fatigue_test_report_v1.3.pdf',3,'aaaaaaaa-1111-4111-8111-111111111111',timezone('utc', now()) - interval '10 days',timezone('utc', now()) - interval '10 days'),
  ('88888888-8888-8888-8888-888888888882','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333332','hydrovalve_assembly_cad.pdf','cad',null,'aaaaaaaa-1111-4111-8111-111111111111/33333333-3333-3333-3333-333333333332/hydrovalve_assembly_cad.pdf',1,'aaaaaaaa-1111-4111-8111-111111111111',timezone('utc', now()) - interval '9 days',timezone('utc', now()) - interval '9 days'),
  ('88888888-8888-8888-8888-888888888883','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333333','medipump_iec60601_specification.pdf','specification',null,'aaaaaaaa-1111-4111-8111-111111111111/33333333-3333-3333-3333-333333333333/medipump_iec60601_specification.pdf',2,'aaaaaaaa-1111-4111-8111-111111111111',timezone('utc', now()) - interval '8 days',timezone('utc', now()) - interval '8 days'),
  ('88888888-8888-8888-8888-888888888884','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333331','aeroframe_as9100_certification_packet.pdf','compliance_certificate',null,'aaaaaaaa-1111-4111-8111-111111111111/33333333-3333-3333-3333-333333333331/aeroframe_as9100_certification_packet.pdf',1,'aaaaaaaa-1111-4111-8111-111111111111',timezone('utc', now()) - interval '6 days',timezone('utc', now()) - interval '6 days'),
  ('88888888-8888-8888-8888-888888888885','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333332','hydrovalve_assembly_instructions.pdf','assembly_instruction',null,'aaaaaaaa-1111-4111-8111-111111111111/33333333-3333-3333-3333-333333333332/hydrovalve_assembly_instructions.pdf',1,'aaaaaaaa-1111-4111-8111-111111111111',timezone('utc', now()) - interval '5 days',timezone('utc', now()) - interval '5 days');

insert into public.change_requests (
  id, user_id, product_id, title, description, status, requested_by, created_at, updated_at
)
values
  ('99999999-9999-9999-9999-999999999991','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333331','Revise bracket wall thickness from 3mm to 3.5mm','Fatigue test data shows micro-cracking near the rib section under peak load. Increasing wall thickness to 3.5mm is expected to improve cycle life beyond 50,000 load cycles.','in_review','aaaaaaaa-1111-4111-8111-111111111111',timezone('utc', now()) - interval '4 days',timezone('utc', now()) - interval '2 days'),
  ('99999999-9999-9999-9999-999999999992','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333332','Upgrade seal material to PTFE for high-temperature compatibility','Field testing at 120C revealed early seal degradation with the original NBR material. PTFE compound is rated to 200C and has passed initial flow bench validation.','approved','aaaaaaaa-1111-4111-8111-111111111111',timezone('utc', now()) - interval '5 days',timezone('utc', now()) - interval '2 days');

insert into public.approvals (
  id, change_request_id, approver_id, status, approved_at, created_at, updated_at
)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1','99999999-9999-9999-9999-999999999991','aaaaaaaa-1111-4111-8111-111111111111','pending',null,timezone('utc', now()) - interval '4 days',timezone('utc', now()) - interval '2 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2','99999999-9999-9999-9999-999999999992','aaaaaaaa-1111-4111-8111-111111111111','approved',timezone('utc', now()) - interval '2 days',timezone('utc', now()) - interval '5 days',timezone('utc', now()) - interval '2 days');

insert into public.quality_issues (
  id, user_id, product_id, issue_title, description, severity, status, reported_by, created_at, updated_at
)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333331','Micro-crack detected on rib section during fatigue load cycle','Crack initiation observed at the rib-to-flange interface after 32,000 load cycles. Suspected stress concentration at the existing 3mm wall transition.','high','investigating','aaaaaaaa-1111-4111-8111-111111111111',timezone('utc', now()) - interval '3 days',timezone('utc', now()) - interval '1 day'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333332','Seal leak detected at 200 bar pressure cycle','Hydraulic fluid bypass measured at 0.4 ml/min across the actuator seal at maximum rated pressure. Initial analysis points to hardness variation in the NBR batch.','high','open','aaaaaaaa-1111-4111-8111-111111111111',timezone('utc', now()) - interval '2 days',timezone('utc', now()) - interval '1 day');

insert into public.projects (
  id, user_id, product_id, project_name, deadline, status, created_at, updated_at
)
values
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333331','AeroFrame DVT milestone',current_date + 14,'testing',timezone('utc', now()) - interval '10 days',timezone('utc', now()) - interval '2 days'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333332','HydroValve pilot build',current_date + 21,'prototype',timezone('utc', now()) - interval '11 days',timezone('utc', now()) - interval '3 days'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc3','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333333','MediPump design freeze',current_date + 28,'design',timezone('utc', now()) - interval '12 days',timezone('utc', now()) - interval '4 days');

insert into public.manufacturing_process_steps (
  id, product_id, sequence_number, step_name, workstation, instructions, created_at, updated_at
)
values
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1','33333333-3333-3333-3333-333333333332',10,'Valve body CNC machining','Machining Cell 3 / Station A','Load stainless steel billet into the 5-axis CNC. Run program HVP-v09-BODY. Measure bore diameter and surface finish after completion. Reject any unit outside +/-0.02mm tolerance.',timezone('utc', now()) - interval '6 days',timezone('utc', now()) - interval '6 days'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2','33333333-3333-3333-3333-333333333332',20,'PTFE seal and O-ring installation','Assembly Cell / Station C','Install PTFE seal kit per drawing HVP-2204-ASM-020. Apply MoS2 lubricant to O-ring grooves. Confirm actuator travel is within 0.5mm of nominal before torquing end caps.',timezone('utc', now()) - interval '6 days',timezone('utc', now()) - interval '6 days'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd3','33333333-3333-3333-3333-333333333332',30,'Hydrostatic pressure test and leak verification','Test Bay / Bench B','Pressurize to 385 bar (110% of rated) for 5 minutes. Inspect all joints and seals for leakage using fluorescent dye penetrant. Quarantine and tag any unit with visible bypass.',timezone('utc', now()) - interval '6 days',timezone('utc', now()) - interval '6 days');

insert into public.compliance_records (
  id, user_id, product_id, document_id, compliance_name, authority, status, due_date, validated_at, notes, created_at, updated_at
)
values
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333331','88888888-8888-8888-8888-888888888884','AS9100 Rev D certification','AS9100','needs_review',current_date + 10,null,'Awaiting updated fatigue test report with revised wall thickness data before resubmission to the certifying authority.',timezone('utc', now()) - interval '5 days',timezone('utc', now()) - interval '1 day'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333332',null,'ISO 9001 quality management system','ISO','valid',current_date + 120,timezone('utc', now()) - interval '8 days','PTFE seal material substitution remains within approved material classification. No re-submission required.',timezone('utc', now()) - interval '8 days',timezone('utc', now()) - interval '8 days');

insert into public.product_risks (
  id, user_id, product_id, risk_title, description, severity, status, mitigation_plan, owner_name, created_at, updated_at
)
values
  ('ffffffff-ffff-ffff-ffff-fffffffffff1','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333331','Ti-6Al-4V billet lead time extends DVT schedule','Primary supplier quoting 14-week lead time on next billet order due to raw material allocation constraints. This may delay DVT start by 6 weeks.','high','monitoring','Qualify secondary supplier and order safety stock of two billets to cover DVT and early PVT builds.','Simran Chandani',timezone('utc', now()) - interval '4 days',timezone('utc', now()) - interval '1 day'),
  ('ffffffff-ffff-ffff-ffff-fffffffffff2','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333332','Seal integrity under repeated thermal cycling','PTFE seal shows dimensional change after 200 thermal cycles between -20C and 120C in accelerated life testing. Long-term sealing performance at rated temperature range needs further validation.','critical','identified','Run additional 500-cycle thermal endurance test on PTFE seal compound. Evaluate alternative PEEK-reinforced seal as fallback.','Simran Chandani',timezone('utc', now()) - interval '3 days',timezone('utc', now()) - interval '1 day');

insert into public.customer_feedback (
  id, user_id, product_id, customer_name, channel, rating, feedback_text, created_at, updated_at
)
values
  ('12121212-1212-4212-8212-121212121211','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333331','Orion Aerospace Systems','sales_call',4,'Impressed with the weight-to-strength ratio on the v1.3 prototype. Awaiting the updated fatigue report before committing to the production forecast for the next airframe program.',timezone('utc', now()) - interval '2 days',timezone('utc', now()) - interval '2 days'),
  ('12121212-1212-4212-8212-121212121212','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333332','Nordic Industrial Automation','support_ticket',5,'The PTFE seal upgrade has solved the high-temperature bypass issue entirely. Pilot installation has been running at 115C for three weeks with zero leakage.',timezone('utc', now()) - interval '1 day',timezone('utc', now()) - interval '1 day');

insert into public.notifications (
  id, user_id, product_id, title, message, level, related_path, is_read, created_at, updated_at
)
values
  ('13131313-1313-4313-8313-131313131311','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333331','Wall thickness change request is in review','The AeroFrame bracket thickness revision is awaiting approval closure before DVT build release.','warning','/dashboard/changes',false,timezone('utc', now()) - interval '1 day',timezone('utc', now()) - interval '1 day'),
  ('13131313-1313-4313-8313-131313131312','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333332','PTFE seal upgrade approved','HydroValve seal material change can move into pilot production build.','success','/dashboard/changes',false,timezone('utc', now()) - interval '12 hours',timezone('utc', now()) - interval '12 hours'),
  ('13131313-1313-4313-8313-131313131313','aaaaaaaa-1111-4111-8111-111111111111','33333333-3333-3333-3333-333333333331','AS9100 evidence needs refresh','AeroFrame compliance package is missing the revised fatigue test data required for AS9100 resubmission.','warning','/dashboard/products/33333333-3333-3333-3333-333333333331',false,timezone('utc', now()) - interval '8 hours',timezone('utc', now()) - interval '8 hours');

commit;
