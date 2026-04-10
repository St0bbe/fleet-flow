
-- Create admin user (password: FleetAdmin2026!)
-- The trigger will auto-create the profile
DO $$
DECLARE
  admin_uid UUID;
BEGIN
  -- Check if admin user already exists
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'emersonstobbe02@gmail.com';
  
  IF admin_uid IS NULL THEN
    -- Insert admin user
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, confirmation_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'emersonstobbe02@gmail.com',
      crypt('FleetAdmin2026!', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Administrador"}',
      ''
    )
    RETURNING id INTO admin_uid;
  END IF;
  
  -- Ensure profile exists with admin role
  INSERT INTO public.profiles (user_id, display_name, role, must_change_password)
  VALUES (admin_uid, 'Administrador', 'admin', false)
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin', must_change_password = false;
  
  -- Ensure admin role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
