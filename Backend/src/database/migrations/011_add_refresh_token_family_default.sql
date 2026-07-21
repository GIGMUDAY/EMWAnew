ALTER TABLE refresh_tokens
  ALTER COLUMN family_id SET DEFAULT gen_random_uuid();
