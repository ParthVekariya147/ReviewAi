-- Migration 013: Seed super admin user
-- Creates the auth user if not exists, then grants super_admin role.
-- Run in Supabase SQL editor.

DO $$
DECLARE
  _user_id uuid;
  _email   text := 'parthvekariya147@gmail.com';
  _password text := 'Admin@Reevo2024';
BEGIN
  -- Check if user already exists in auth
  SELECT id INTO _user_id FROM auth.users WHERE email = _email;

  IF _user_id IS NULL THEN
    -- Create auth user with hashed password
    INSERT INTO auth.users (
      instance_id,
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
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      _email,
      crypt(_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now()
    )
    RETURNING id INTO _user_id;

    RAISE NOTICE 'Created new auth user: % (id: %)', _email, _user_id;
  ELSE
    -- User exists — update password
    UPDATE auth.users
    SET encrypted_password = crypt(_password, gen_salt('bf')),
        updated_at         = now()
    WHERE id = _user_id;

    RAISE NOTICE 'Updated password for existing user: % (id: %)', _email, _user_id;
  END IF;

  -- Seed admin_users table
  INSERT INTO public.admin_users (id, email, role)
  VALUES (_user_id, _email, 'super_admin')
  ON CONFLICT (id) DO UPDATE SET role = 'super_admin', email = EXCLUDED.email;

  RAISE NOTICE 'super_admin seeded successfully for %', _email;
END $$;
