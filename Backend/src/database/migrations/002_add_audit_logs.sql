CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  administrator_id uuid NOT NULL REFERENCES admins(id),
  action varchar(100) NOT NULL,
  entity_type varchar(80) NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_admin_created_idx
  ON audit_logs(administrator_id, created_at DESC);

CREATE INDEX IF NOT EXISTS audit_entity_idx
  ON audit_logs(entity_type, entity_id);
