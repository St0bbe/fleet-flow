UPDATE auth.users 
SET encrypted_password = crypt('0850Emer1714@', gen_salt('bf'))
WHERE email = 'emersonstobbe02@gmail.com';