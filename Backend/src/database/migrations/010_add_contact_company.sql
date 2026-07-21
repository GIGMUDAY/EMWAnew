ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS company_name varchar(200);

CREATE INDEX IF NOT EXISTS contact_company_idx
  ON contact_messages(company_name)
  WHERE company_name IS NOT NULL;
