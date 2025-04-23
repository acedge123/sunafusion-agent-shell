
-- Add unique constraint to google_drive_access table
ALTER TABLE public.google_drive_access 
ADD CONSTRAINT google_drive_access_user_id_key UNIQUE (user_id);
