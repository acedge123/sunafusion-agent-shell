
-- ============================================================
-- agent_contacts: People/Entity directory
-- ============================================================
CREATE TABLE public.agent_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  name text NOT NULL,
  email text,
  phone text,
  company text,
  role text,
  notes text,
  tags text[],
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_contacts ENABLE ROW LEVEL SECURITY;

-- Owner CRUD
CREATE POLICY "Owner can read own contacts"
  ON public.agent_contacts FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owner can insert own contacts"
  ON public.agent_contacts FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can update own contacts"
  ON public.agent_contacts FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owner can delete own contacts"
  ON public.agent_contacts FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Service role bypass
CREATE POLICY "Service role can manage all contacts"
  ON public.agent_contacts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- updated_at trigger
CREATE TRIGGER update_agent_contacts_updated_at
  BEFORE UPDATE ON public.agent_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- agent_tasks: Human-facing task tracking
-- ============================================================
CREATE TABLE public.agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text DEFAULT 'medium',
  due_date timestamptz,
  completed_at timestamptz,
  domain text,
  tags text[],
  source text DEFAULT 'agent',
  related_learning_id uuid REFERENCES public.agent_learnings(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

-- Owner CRUD
CREATE POLICY "Owner can read own tasks"
  ON public.agent_tasks FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owner can insert own tasks"
  ON public.agent_tasks FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can update own tasks"
  ON public.agent_tasks FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owner can delete own tasks"
  ON public.agent_tasks FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Service role bypass
CREATE POLICY "Service role can manage all tasks"
  ON public.agent_tasks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- updated_at trigger
CREATE TRIGGER update_agent_tasks_updated_at
  BEFORE UPDATE ON public.agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for common queries
CREATE INDEX idx_agent_tasks_status ON public.agent_tasks (status);
CREATE INDEX idx_agent_tasks_owner_status ON public.agent_tasks (owner_id, status);
CREATE INDEX idx_agent_tasks_due_date ON public.agent_tasks (due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_agent_contacts_owner ON public.agent_contacts (owner_id);
CREATE INDEX idx_agent_contacts_email ON public.agent_contacts (email) WHERE email IS NOT NULL;
