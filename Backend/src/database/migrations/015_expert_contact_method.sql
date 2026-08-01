ALTER TABLE expert_applications
  ALTER COLUMN email DROP NOT NULL;

ALTER TABLE expert_applications
  DROP CONSTRAINT IF EXISTS expert_applications_contact_method_check;

ALTER TABLE expert_applications
  ADD CONSTRAINT expert_applications_contact_method_check
  CHECK (
    NULLIF(BTRIM(email), '') IS NOT NULL
    OR NULLIF(BTRIM(phone_number), '') IS NOT NULL
  );
