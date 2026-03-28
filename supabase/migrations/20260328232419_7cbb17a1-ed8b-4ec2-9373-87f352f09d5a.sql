
-- Create missing profile for alan@thegig.agency
INSERT INTO public.profiles (id, username, avatar_url)
VALUES ('0a7ef2f0-c841-4cbc-9b8b-b7b4545b9edf', 'alan@thegig.agency', 'https://api.dicebear.com/7.x/avataaars/svg?seed=0a7ef2f0-c841-4cbc-9b8b-b7b4545b9edf')
ON CONFLICT (id) DO NOTHING;

-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('0a7ef2f0-c841-4cbc-9b8b-b7b4545b9edf', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
