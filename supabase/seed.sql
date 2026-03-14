do $$
declare
  demo_user_id constant uuid := 'aaaaaaaa-1111-4111-8111-111111111111';
  demo_email constant text := 'simra.chandani@bacancy.com';
  seeded_at constant timestamptz := timezone('utc', now());
begin
  delete from auth.sessions
  where user_id = demo_user_id;

  delete from auth.refresh_tokens
  where user_id = demo_user_id;

  delete from auth.identities
  where user_id = demo_user_id
     or provider_id = demo_email;

  delete from auth.users
  where id = demo_user_id
     or email = demo_email;

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    demo_user_id,
    'authenticated',
    'authenticated',
    demo_email,
    crypt('DemoPass123!', gen_salt('bf')),
    seeded_at,
    null,
    '',
    null,
    '',
    null,
    '',
    '',
    null,
    seeded_at,
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', 'Simran Chandani'),
    null,
    seeded_at,
    seeded_at,
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null
  )
  on conflict (id) do update
    set instance_id = excluded.instance_id,
        email = excluded.email,
        encrypted_password = excluded.encrypted_password,
        email_confirmed_at = excluded.email_confirmed_at,
        last_sign_in_at = excluded.last_sign_in_at,
        raw_app_meta_data = excluded.raw_app_meta_data,
        raw_user_meta_data = excluded.raw_user_meta_data,
        updated_at = excluded.updated_at;

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
  )
  on conflict (id) do update
    set identity_data = excluded.identity_data,
        provider_id = excluded.provider_id,
        updated_at = excluded.updated_at,
        last_sign_in_at = excluded.last_sign_in_at;

  insert into public.users (
    id,
    email,
    full_name,
    created_at,
    updated_at
  )
  values (
    demo_user_id,
    demo_email,
    'Simran Chandani',
    seeded_at,
    seeded_at
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        updated_at = excluded.updated_at;
end;
$$;

-- ── Products ─────────────────────────────────────────────────────────────────

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
  )
on conflict (id) do update
  set user_id = excluded.user_id,
      product_name = excluded.product_name,
      product_sku = excluded.product_sku,
      product_category = excluded.product_category,
      description = excluded.description,
      lifecycle_stage = excluded.lifecycle_stage,
      updated_at = excluded.updated_at;

-- ── Product Versions ──────────────────────────────────────────────────────────

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
  )
on conflict (id) do update
  set version_code = excluded.version_code,
      summary = excluded.summary,
      is_current = excluded.is_current,
      released_at = excluded.released_at,
      updated_at = excluded.updated_at;

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

-- ── Suppliers ─────────────────────────────────────────────────────────────────

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
  )
on conflict (id) do update
  set user_id = excluded.user_id,
      supplier_name = excluded.supplier_name,
      contact_email = excluded.contact_email,
      country = excluded.country,
      status = excluded.status,
      performance_score = excluded.performance_score,
      updated_at = excluded.updated_at;

-- ── Bill of Materials ─────────────────────────────────────────────────────────

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
  )
on conflict (id) do update
  set product_id = excluded.product_id,
      product_version_id = excluded.product_version_id,
      bom_version = excluded.bom_version,
      updated_at = excluded.updated_at;

-- ── Components ────────────────────────────────────────────────────────────────

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
  -- AeroFrame v1.2 (baseline)
  (
    '77777777-7777-7777-7777-777777777770',
    '66666666-6666-6666-6666-666666666660',
    null,
    '55555555-5555-5555-5555-555555555551',
    'Ti-6Al-4V Billet',
    'CMP-TI-00',
    'module',
    'Precision Metals Group',
    1,
    142.00,
    timezone('utc', now()) - interval '48 days',
    timezone('utc', now()) - interval '48 days'
  ),
  -- AeroFrame v1.3 (current)
  (
    '77777777-7777-7777-7777-777777777771',
    '66666666-6666-6666-6666-666666666661',
    null,
    '55555555-5555-5555-5555-555555555551',
    'Ti-6Al-4V Billet',
    'CMP-TI-01',
    'module',
    'Precision Metals Group',
    1,
    148.50,
    timezone('utc', now()) - interval '21 days',
    timezone('utc', now()) - interval '21 days'
  ),
  (
    '77777777-7777-7777-7777-777777777772',
    '66666666-6666-6666-6666-666666666661',
    null,
    '55555555-5555-5555-5555-555555555551',
    'Fastener Kit',
    'CMP-FKT-02',
    'mechanical',
    'Precision Metals Group',
    1,
    18.40,
    timezone('utc', now()) - interval '21 days',
    timezone('utc', now()) - interval '21 days'
  ),
  (
    '77777777-7777-7777-7777-777777777773',
    '66666666-6666-6666-6666-666666666661',
    '77777777-7777-7777-7777-777777777772',
    '55555555-5555-5555-5555-555555555551',
    'M8 Titanium Bolts',
    'CMP-M8B-03',
    'mechanical',
    'Precision Metals Group',
    8,
    1.85,
    timezone('utc', now()) - interval '21 days',
    timezone('utc', now()) - interval '21 days'
  ),
  (
    '77777777-7777-7777-7777-777777777774',
    '66666666-6666-6666-6666-666666666661',
    '77777777-7777-7777-7777-777777777772',
    '55555555-5555-5555-5555-555555555551',
    'Aerospace Lockwashers',
    'CMP-ALW-04',
    'mechanical',
    'Precision Metals Group',
    8,
    0.60,
    timezone('utc', now()) - interval '21 days',
    timezone('utc', now()) - interval '21 days'
  ),
  (
    '77777777-7777-7777-7777-777777777775',
    '66666666-6666-6666-6666-666666666661',
    null,
    '55555555-5555-5555-5555-555555555551',
    'NDT Inspection Jig',
    'CMP-NDT-05',
    'module',
    'Precision Metals Group',
    1,
    74.00,
    timezone('utc', now()) - interval '21 days',
    timezone('utc', now()) - interval '21 days'
  ),
  -- HydroValve v0.9
  (
    '77777777-7777-7777-7777-777777777776',
    '66666666-6666-6666-6666-666666666662',
    null,
    '55555555-5555-5555-5555-555555555552',
    'Valve Body Assembly',
    'CMP-VBA-06',
    'module',
    'FluidPower Systems Ltd',
    1,
    84.90,
    timezone('utc', now()) - interval '12 days',
    timezone('utc', now()) - interval '12 days'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    '66666666-6666-6666-6666-666666666662',
    '77777777-7777-7777-7777-777777777776',
    '55555555-5555-5555-5555-555555555552',
    'Stainless Steel Housing',
    'CMP-SSH-07',
    'mechanical',
    'FluidPower Systems Ltd',
    1,
    32.50,
    timezone('utc', now()) - interval '12 days',
    timezone('utc', now()) - interval '12 days'
  ),
  (
    '77777777-7777-7777-7777-777777777778',
    '66666666-6666-6666-6666-666666666662',
    '77777777-7777-7777-7777-777777777776',
    '55555555-5555-5555-5555-555555555552',
    'PTFE Actuator Seal Kit',
    'CMP-ASK-08',
    'mechanical',
    'FluidPower Systems Ltd',
    2,
    9.80,
    timezone('utc', now()) - interval '12 days',
    timezone('utc', now()) - interval '12 days'
  ),
  (
    '77777777-7777-7777-7777-777777777779',
    '66666666-6666-6666-6666-666666666662',
    null,
    '55555555-5555-5555-5555-555555555552',
    'Control Interface Board',
    'CMP-CIB-09',
    'module',
    'FluidPower Systems Ltd',
    1,
    46.75,
    timezone('utc', now()) - interval '12 days',
    timezone('utc', now()) - interval '12 days'
  ),
  (
    '77777777-7777-7777-7777-777777777780',
    '66666666-6666-6666-6666-666666666662',
    null,
    '55555555-5555-5555-5555-555555555552',
    'Pressure Sensor',
    'CMP-PSR-10',
    'sensor',
    'FluidPower Systems Ltd',
    1,
    22.40,
    timezone('utc', now()) - interval '12 days',
    timezone('utc', now()) - interval '12 days'
  ),
  -- MediPump v0.7
  (
    '77777777-7777-7777-7777-777777777781',
    '66666666-6666-6666-6666-666666666663',
    null,
    '55555555-5555-5555-5555-555555555553',
    'Peristaltic Pump Assembly',
    'CMP-PPA-11',
    'module',
    'MedTech Materials Co',
    1,
    68.20,
    timezone('utc', now()) - interval '7 days',
    timezone('utc', now()) - interval '7 days'
  ),
  (
    '77777777-7777-7777-7777-777777777782',
    '66666666-6666-6666-6666-666666666663',
    null,
    '55555555-5555-5555-5555-555555555553',
    'Flow Rate Sensor',
    'CMP-FRS-12',
    'sensor',
    'MedTech Materials Co',
    1,
    34.50,
    timezone('utc', now()) - interval '7 days',
    timezone('utc', now()) - interval '7 days'
  ),
  (
    '77777777-7777-7777-7777-777777777783',
    '66666666-6666-6666-6666-666666666663',
    null,
    '55555555-5555-5555-5555-555555555553',
    'Stepper Drive Motor',
    'CMP-SDM-13',
    'module',
    'MedTech Materials Co',
    1,
    29.90,
    timezone('utc', now()) - interval '7 days',
    timezone('utc', now()) - interval '7 days'
  ),
  (
    '77777777-7777-7777-7777-777777777784',
    '66666666-6666-6666-6666-666666666663',
    null,
    '55555555-5555-5555-5555-555555555553',
    'Housing Shell',
    'CMP-HSH-14',
    'mechanical',
    'MedTech Materials Co',
    1,
    14.60,
    timezone('utc', now()) - interval '7 days',
    timezone('utc', now()) - interval '7 days'
  )
on conflict (id) do update
  set bom_id = excluded.bom_id,
      parent_component_id = excluded.parent_component_id,
      supplier_id = excluded.supplier_id,
      component_name = excluded.component_name,
      component_sku = excluded.component_sku,
      component_type = excluded.component_type,
      manufacturer = excluded.manufacturer,
      quantity = excluded.quantity,
      unit_cost = excluded.unit_cost,
      updated_at = excluded.updated_at;

-- ── Documents ─────────────────────────────────────────────────────────────────

insert into public.documents (
  id,
  user_id,
  product_id,
  document_name,
  document_type,
  file_url,
  storage_path,
  version,
  uploaded_by,
  created_at,
  updated_at
)
values
  (
    '88888888-8888-8888-8888-888888888881',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    'aeroframe_fatigue_test_report_v1.3.pdf',
    'test_report',
    null,
    'aaaaaaaa-1111-4111-8111-111111111111/33333333-3333-3333-3333-333333333331/aeroframe_fatigue_test_report_v1.3.pdf',
    3,
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '10 days',
    timezone('utc', now()) - interval '10 days'
  ),
  (
    '88888888-8888-8888-8888-888888888882',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'hydrovalve_assembly_cad.pdf',
    'cad',
    null,
    'aaaaaaaa-1111-4111-8111-111111111111/33333333-3333-3333-3333-333333333332/hydrovalve_assembly_cad.pdf',
    1,
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '9 days',
    timezone('utc', now()) - interval '9 days'
  ),
  (
    '88888888-8888-8888-8888-888888888883',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'medipump_iec60601_specification.pdf',
    'specification',
    null,
    'aaaaaaaa-1111-4111-8111-111111111111/33333333-3333-3333-3333-333333333333/medipump_iec60601_specification.pdf',
    2,
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '8 days',
    timezone('utc', now()) - interval '8 days'
  ),
  (
    '88888888-8888-8888-8888-888888888884',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    'aeroframe_as9100_certification_packet.pdf',
    'compliance_certificate',
    null,
    'aaaaaaaa-1111-4111-8111-111111111111/33333333-3333-3333-3333-333333333331/aeroframe_as9100_certification_packet.pdf',
    1,
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '6 days',
    timezone('utc', now()) - interval '6 days'
  ),
  (
    '88888888-8888-8888-8888-888888888885',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'hydrovalve_assembly_instructions.pdf',
    'assembly_instruction',
    null,
    'aaaaaaaa-1111-4111-8111-111111111111/33333333-3333-3333-3333-333333333332/hydrovalve_assembly_instructions.pdf',
    1,
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now()) - interval '5 days'
  )
on conflict (id) do update
  set user_id = excluded.user_id,
      product_id = excluded.product_id,
      document_name = excluded.document_name,
      document_type = excluded.document_type,
      storage_path = excluded.storage_path,
      version = excluded.version,
      uploaded_by = excluded.uploaded_by,
      updated_at = excluded.updated_at;

-- ── Change Requests ───────────────────────────────────────────────────────────

insert into public.change_requests (
  id,
  user_id,
  product_id,
  title,
  description,
  status,
  requested_by,
  created_at,
  updated_at
)
values
  (
    '99999999-9999-9999-9999-999999999991',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    'Revise bracket wall thickness from 3mm to 3.5mm',
    'Fatigue test data shows micro-cracking near the rib section under peak load. Increasing wall thickness to 3.5mm is expected to improve cycle life beyond 50,000 load cycles.',
    'in_review',
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '4 days',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    '99999999-9999-9999-9999-999999999992',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'Upgrade seal material to PTFE for high-temperature compatibility',
    'Field testing at 120°C revealed early seal degradation with the original NBR material. PTFE compound is rated to 200°C and has passed initial flow bench validation.',
    'approved',
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now()) - interval '2 days'
  )
on conflict (id) do update
  set user_id = excluded.user_id,
      product_id = excluded.product_id,
      title = excluded.title,
      description = excluded.description,
      status = excluded.status,
      updated_at = excluded.updated_at;

-- ── Approvals ─────────────────────────────────────────────────────────────────

insert into public.approvals (
  id,
  change_request_id,
  approver_id,
  status,
  approved_at,
  created_at,
  updated_at
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '99999999-9999-9999-9999-999999999991',
    'aaaaaaaa-1111-4111-8111-111111111111',
    'pending',
    null,
    timezone('utc', now()) - interval '4 days',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '99999999-9999-9999-9999-999999999992',
    'aaaaaaaa-1111-4111-8111-111111111111',
    'approved',
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now()) - interval '2 days'
  )
on conflict (id) do update
  set change_request_id = excluded.change_request_id,
      approver_id = excluded.approver_id,
      status = excluded.status,
      approved_at = excluded.approved_at,
      updated_at = excluded.updated_at;

-- ── Quality Issues ────────────────────────────────────────────────────────────

insert into public.quality_issues (
  id,
  user_id,
  product_id,
  issue_title,
  description,
  severity,
  status,
  reported_by,
  created_at,
  updated_at
)
values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    'Micro-crack detected on rib section during fatigue load cycle',
    'Crack initiation observed at the rib-to-flange interface after 32,000 load cycles in EVT specimens. Suspected stress concentration at the existing 3mm wall transition.',
    'high',
    'investigating',
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '3 days',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'Seal leak detected at 200 bar pressure cycle',
    'Hydraulic fluid bypass measured at 0.4 ml/min across the actuator seal at maximum rated pressure. Initial analysis points to hardness variation in the NBR batch.',
    'high',
    'open',
    'aaaaaaaa-1111-4111-8111-111111111111',
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now()) - interval '1 day'
  )
on conflict (id) do update
  set user_id = excluded.user_id,
      product_id = excluded.product_id,
      issue_title = excluded.issue_title,
      description = excluded.description,
      severity = excluded.severity,
      status = excluded.status,
      updated_at = excluded.updated_at;

-- ── Projects ──────────────────────────────────────────────────────────────────

insert into public.projects (
  id,
  user_id,
  product_id,
  project_name,
  deadline,
  status,
  created_at,
  updated_at
)
values
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    'AeroFrame DVT milestone',
    current_date + 14,
    'testing',
    timezone('utc', now()) - interval '10 days',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'HydroValve pilot build',
    current_date + 21,
    'prototype',
    timezone('utc', now()) - interval '11 days',
    timezone('utc', now()) - interval '3 days'
  ),
  (
    'cccccccc-cccc-cccc-cccc-ccccccccccc3',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    'MediPump design freeze',
    current_date + 28,
    'design',
    timezone('utc', now()) - interval '12 days',
    timezone('utc', now()) - interval '4 days'
  )
on conflict (id) do update
  set user_id = excluded.user_id,
      product_id = excluded.product_id,
      project_name = excluded.project_name,
      deadline = excluded.deadline,
      status = excluded.status,
      updated_at = excluded.updated_at;

-- ── Manufacturing Process Steps ───────────────────────────────────────────────

insert into public.manufacturing_process_steps (
  id,
  product_id,
  sequence_number,
  step_name,
  workstation,
  instructions,
  created_at,
  updated_at
)
values
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    '33333333-3333-3333-3333-333333333332',
    10,
    'Valve body CNC machining',
    'Machining Cell 3 / Station A',
    'Load stainless steel billet into the 5-axis CNC. Run program HVP-v09-BODY. Measure bore diameter and surface finish after completion. Reject any unit outside ±0.02mm tolerance.',
    timezone('utc', now()) - interval '6 days',
    timezone('utc', now()) - interval '6 days'
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd2',
    '33333333-3333-3333-3333-333333333332',
    20,
    'PTFE seal and O-ring installation',
    'Assembly Cell / Station C',
    'Install PTFE seal kit per drawing HVP-2204-ASM-020. Apply MoS2 lubricant to O-ring grooves. Confirm actuator travel is within 0.5mm of nominal before torquing end caps.',
    timezone('utc', now()) - interval '6 days',
    timezone('utc', now()) - interval '6 days'
  ),
  (
    'dddddddd-dddd-dddd-dddd-ddddddddddd3',
    '33333333-3333-3333-3333-333333333332',
    30,
    'Hydrostatic pressure test and leak verification',
    'Test Bay / Bench B',
    'Pressurize to 385 bar (110% of rated) for 5 minutes. Inspect all joints and seals for leakage using fluorescent dye penetrant. Quarantine and tag any unit with visible bypass.',
    timezone('utc', now()) - interval '6 days',
    timezone('utc', now()) - interval '6 days'
  )
on conflict (id) do update
  set product_id = excluded.product_id,
      sequence_number = excluded.sequence_number,
      step_name = excluded.step_name,
      workstation = excluded.workstation,
      instructions = excluded.instructions,
      updated_at = excluded.updated_at;

-- ── Compliance Records ────────────────────────────────────────────────────────

insert into public.compliance_records (
  id,
  user_id,
  product_id,
  document_id,
  compliance_name,
  authority,
  status,
  due_date,
  validated_at,
  notes,
  created_at,
  updated_at
)
values
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    '88888888-8888-8888-8888-888888888884',
    'AS9100 Rev D certification',
    'AS9100',
    'needs_review',
    current_date + 10,
    null,
    'Awaiting updated fatigue test report with revised wall thickness data before resubmission to the certifying authority.',
    timezone('utc', now()) - interval '5 days',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    null,
    'ISO 9001 quality management system',
    'ISO',
    'valid',
    current_date + 120,
    timezone('utc', now()) - interval '8 days',
    'PTFE seal material substitution remains within approved material classification. No re-submission required.',
    timezone('utc', now()) - interval '8 days',
    timezone('utc', now()) - interval '8 days'
  )
on conflict (id) do update
  set user_id = excluded.user_id,
      product_id = excluded.product_id,
      document_id = excluded.document_id,
      compliance_name = excluded.compliance_name,
      authority = excluded.authority,
      status = excluded.status,
      due_date = excluded.due_date,
      validated_at = excluded.validated_at,
      notes = excluded.notes,
      updated_at = excluded.updated_at;

-- ── Product Risks ─────────────────────────────────────────────────────────────

insert into public.product_risks (
  id,
  user_id,
  product_id,
  risk_title,
  description,
  severity,
  status,
  mitigation_plan,
  owner_name,
  created_at,
  updated_at
)
values
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff1',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    'Ti-6Al-4V billet lead time extends DVT schedule',
    'Primary supplier quoting 14-week lead time on next billet order due to raw material allocation constraints. This may delay DVT start by 6 weeks.',
    'high',
    'monitoring',
    'Qualify secondary supplier and order safety stock of two billets to cover DVT and early PVT builds.',
    'Simran Chandani',
    timezone('utc', now()) - interval '4 days',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    'ffffffff-ffff-ffff-ffff-fffffffffff2',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'Seal integrity under repeated thermal cycling',
    'PTFE seal shows dimensional change after 200 thermal cycles between -20°C and 120°C in accelerated life testing. Long-term sealing performance at rated temperature range needs further validation.',
    'critical',
    'identified',
    'Run additional 500-cycle thermal endurance test on PTFE seal compound. Evaluate alternative PEEK-reinforced seal as fallback.',
    'Simran Chandani',
    timezone('utc', now()) - interval '3 days',
    timezone('utc', now()) - interval '1 day'
  )
on conflict (id) do update
  set user_id = excluded.user_id,
      product_id = excluded.product_id,
      risk_title = excluded.risk_title,
      description = excluded.description,
      severity = excluded.severity,
      status = excluded.status,
      mitigation_plan = excluded.mitigation_plan,
      owner_name = excluded.owner_name,
      updated_at = excluded.updated_at;

-- ── Customer Feedback ─────────────────────────────────────────────────────────

insert into public.customer_feedback (
  id,
  user_id,
  product_id,
  customer_name,
  channel,
  rating,
  feedback_text,
  created_at,
  updated_at
)
values
  (
    '12121212-1212-4212-8212-121212121211',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    'Orion Aerospace Systems',
    'sales_call',
    4,
    'Impressed with the weight-to-strength ratio on the v1.3 prototype. Awaiting the updated fatigue report before committing to the production forecast for the next airframe program.',
    timezone('utc', now()) - interval '2 days',
    timezone('utc', now()) - interval '2 days'
  ),
  (
    '12121212-1212-4212-8212-121212121212',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'Nordic Industrial Automation',
    'support_ticket',
    5,
    'The PTFE seal upgrade has solved the high-temperature bypass issue entirely. Pilot installation has been running at 115°C for three weeks with zero leakage.',
    timezone('utc', now()) - interval '1 day',
    timezone('utc', now()) - interval '1 day'
  )
on conflict (id) do update
  set user_id = excluded.user_id,
      product_id = excluded.product_id,
      customer_name = excluded.customer_name,
      channel = excluded.channel,
      rating = excluded.rating,
      feedback_text = excluded.feedback_text,
      updated_at = excluded.updated_at;

-- ── Notifications ─────────────────────────────────────────────────────────────

insert into public.notifications (
  id,
  user_id,
  product_id,
  title,
  message,
  level,
  related_path,
  is_read,
  created_at,
  updated_at
)
values
  (
    '13131313-1313-4313-8313-131313131311',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    'Wall thickness change request is in review',
    'The AeroFrame bracket thickness revision is awaiting approval closure before DVT build release.',
    'warning',
    '/dashboard/changes',
    false,
    timezone('utc', now()) - interval '1 day',
    timezone('utc', now()) - interval '1 day'
  ),
  (
    '13131313-1313-4313-8313-131313131312',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333332',
    'PTFE seal upgrade approved',
    'HydroValve seal material change can move into pilot production build.',
    'success',
    '/dashboard/changes',
    false,
    timezone('utc', now()) - interval '12 hours',
    timezone('utc', now()) - interval '12 hours'
  ),
  (
    '13131313-1313-4313-8313-131313131313',
    'aaaaaaaa-1111-4111-8111-111111111111',
    '33333333-3333-3333-3333-333333333331',
    'AS9100 evidence needs refresh',
    'AeroFrame compliance package is missing the revised fatigue test data required for AS9100 resubmission.',
    'warning',
    '/dashboard/products/33333333-3333-3333-3333-333333333331',
    false,
    timezone('utc', now()) - interval '8 hours',
    timezone('utc', now()) - interval '8 hours'
  )
on conflict (id) do update
  set user_id = excluded.user_id,
      product_id = excluded.product_id,
      title = excluded.title,
      message = excluded.message,
      level = excluded.level,
      related_path = excluded.related_path,
      is_read = excluded.is_read,
      updated_at = excluded.updated_at;
