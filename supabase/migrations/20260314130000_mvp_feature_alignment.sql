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

do $$
declare
  fallback_user_id uuid;
begin
  select id into fallback_user_id
  from auth.users
  where email = 'simra.chandani@bacancy.com'
  limit 1;

  if fallback_user_id is null then
    select id into fallback_user_id
    from auth.users
    order by created_at asc
    limit 1;
  end if;

  if fallback_user_id is not null then
    update public.products
    set user_id = fallback_user_id
    where user_id is null;

    update public.suppliers
    set user_id = fallback_user_id
    where user_id is null;

    update public.documents as documents
    set user_id = products.user_id
    from public.products as products
    where documents.user_id is null
      and documents.product_id = products.id;

    update public.change_requests as change_requests
    set user_id = products.user_id
    from public.products as products
    where change_requests.user_id is null
      and change_requests.product_id = products.id;

    update public.quality_issues as quality_issues
    set user_id = products.user_id
    from public.products as products
    where quality_issues.user_id is null
      and quality_issues.product_id = products.id;

    update public.projects as projects
    set user_id = products.user_id
    from public.products as products
    where projects.user_id is null
      and projects.product_id = products.id;
  end if;
end;
$$;

do $$
begin
  if not exists (select 1 from public.products where user_id is null) then
    execute 'alter table public.products alter column user_id set not null';
  else
    raise notice 'Skipping NOT NULL on public.products.user_id until legacy rows are claimed by an auth user.';
  end if;

  if not exists (select 1 from public.suppliers where user_id is null) then
    execute 'alter table public.suppliers alter column user_id set not null';
  else
    raise notice 'Skipping NOT NULL on public.suppliers.user_id until legacy rows are claimed by an auth user.';
  end if;

  if not exists (select 1 from public.documents where user_id is null) then
    execute 'alter table public.documents alter column user_id set not null';
  else
    raise notice 'Skipping NOT NULL on public.documents.user_id until legacy rows are claimed by an auth user.';
  end if;

  if not exists (select 1 from public.change_requests where user_id is null) then
    execute 'alter table public.change_requests alter column user_id set not null';
  else
    raise notice 'Skipping NOT NULL on public.change_requests.user_id until legacy rows are claimed by an auth user.';
  end if;

  if not exists (select 1 from public.quality_issues where user_id is null) then
    execute 'alter table public.quality_issues alter column user_id set not null';
  else
    raise notice 'Skipping NOT NULL on public.quality_issues.user_id until legacy rows are claimed by an auth user.';
  end if;

  if not exists (select 1 from public.projects where user_id is null) then
    execute 'alter table public.projects alter column user_id set not null';
  else
    raise notice 'Skipping NOT NULL on public.projects.user_id until legacy rows are claimed by an auth user.';
  end if;
end;
$$;

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

create index manufacturing_process_steps_product_id_idx
  on public.manufacturing_process_steps (product_id, sequence_number);

create index compliance_records_user_id_idx on public.compliance_records (user_id);
create index compliance_records_product_id_idx on public.compliance_records (product_id);
create index compliance_records_due_date_idx on public.compliance_records (user_id, due_date);

create index product_risks_user_id_idx on public.product_risks (user_id);
create index product_risks_product_id_idx on public.product_risks (product_id);
create index product_risks_open_idx
  on public.product_risks (user_id, status)
  where status in ('identified', 'monitoring');

create index customer_feedback_user_id_idx on public.customer_feedback (user_id);
create index customer_feedback_product_id_idx on public.customer_feedback (product_id);

create index notifications_user_id_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx
  on public.notifications (user_id, created_at desc)
  where is_read = false;

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

alter table public.manufacturing_process_steps enable row level security;
alter table public.compliance_records enable row level security;
alter table public.product_risks enable row level security;
alter table public.customer_feedback enable row level security;
alter table public.notifications enable row level security;

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

drop policy if exists storage_objects_select_policy on storage.objects;
drop policy if exists storage_objects_insert_policy on storage.objects;
drop policy if exists storage_objects_update_policy on storage.objects;
drop policy if exists storage_objects_delete_policy on storage.objects;

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
