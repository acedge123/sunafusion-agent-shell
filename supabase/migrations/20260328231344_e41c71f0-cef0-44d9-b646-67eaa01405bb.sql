
CREATE POLICY "Anon can read all agent files" ON public.agent_files
  FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated can read all agent files" ON public.agent_files
  FOR SELECT TO authenticated USING (true);
