INSERT INTO public.user_roles (user_id, role)
VALUES ('0a7ef2f0-c841-4cbc-9b8b-b7b4545b9edf', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;