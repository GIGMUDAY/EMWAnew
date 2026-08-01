ALTER TABLE expert_applications
  ADD COLUMN IF NOT EXISTS last_edited_by uuid REFERENCES admins(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_edited_at timestamptz;

CREATE INDEX IF NOT EXISTS expert_last_edited_idx
  ON expert_applications(last_edited_at DESC)
  WHERE last_edited_at IS NOT NULL;
