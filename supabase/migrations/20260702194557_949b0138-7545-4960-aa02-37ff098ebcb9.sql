
-- watched_tins: TINs a signed-in user wants monitored against future audit-list updates
CREATE TABLE public.watched_tins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tin text NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_checked_at timestamptz,
  matched_at timestamptz,
  matched_source smallint,
  CONSTRAINT watched_tins_tin_format CHECK (tin ~ '^[0-9]{12}$'),
  CONSTRAINT watched_tins_unique_per_user UNIQUE (user_id, tin)
);
CREATE INDEX watched_tins_user_id_idx ON public.watched_tins(user_id);
CREATE INDEX watched_tins_tin_idx ON public.watched_tins(tin) WHERE matched_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.watched_tins TO authenticated;
GRANT ALL ON public.watched_tins TO service_role;

ALTER TABLE public.watched_tins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own watched TINs (select)"
  ON public.watched_tins FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users manage own watched TINs (insert)"
  ON public.watched_tins FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own watched TINs (update)"
  ON public.watched_tins FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own watched TINs (delete)"
  ON public.watched_tins FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- alert_log: append-only history of alert emails sent
CREATE TABLE public.alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tin text NOT NULL,
  matched_source smallint,
  sent_at timestamptz NOT NULL DEFAULT now(),
  email_status text
);
CREATE INDEX alert_log_user_id_idx ON public.alert_log(user_id);

GRANT SELECT ON public.alert_log TO authenticated;
GRANT ALL ON public.alert_log TO service_role;

ALTER TABLE public.alert_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own alert history"
  ON public.alert_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
