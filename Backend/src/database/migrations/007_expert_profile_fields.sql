ALTER TABLE expert_applications
  ADD COLUMN IF NOT EXISTS professional_title varchar(150),
  ADD COLUMN IF NOT EXISTS location varchar(150),
  ADD COLUMN IF NOT EXISTS profile_photo_url text;

UPDATE expert_applications
SET
  professional_title = COALESCE(professional_title, area_of_expertise),
  location = COALESCE(location, 'Not provided');

ALTER TABLE expert_applications
  ALTER COLUMN professional_title SET NOT NULL,
  ALTER COLUMN location SET NOT NULL,
  ALTER COLUMN phone_number DROP NOT NULL,
  ALTER COLUMN years_of_experience DROP NOT NULL,
  ALTER COLUMN qualifications DROP NOT NULL;
