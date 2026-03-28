
-- Allow anyone to read objects in the agent-files bucket (for signed URL generation)
CREATE POLICY "Anyone can read agent-files objects"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agent-files');
