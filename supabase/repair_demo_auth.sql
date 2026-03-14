do $$
declare
  legacy_demo_user_id constant uuid := 'aaaaaaaa-1111-4111-8111-111111111111';
  demo_email constant text := 'simra.chandani@bacancy.com';
  archived_email constant text := 'legacy-simra-demo@invalid.local';
begin
  update auth.identities
  set
    provider_id = archived_email,
    identity_data = jsonb_set(
      coalesce(identity_data, '{}'::jsonb),
      '{email}',
      to_jsonb(archived_email)
    ),
    updated_at = timezone('utc', now())
  where user_id = legacy_demo_user_id
     or provider_id = demo_email;

  update auth.users
  set
    email = archived_email,
    updated_at = timezone('utc', now()),
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('legacy_demo_user', true)
  where id = legacy_demo_user_id
     or email = demo_email;
end;
$$;

-- After running this SQL, run:
--   npm run seed:demo-auth
--
-- That script creates an official Supabase Auth user for
-- simra.chandani@bacancy.com and migrates the seeded app data to the new auth id.
