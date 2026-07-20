ALTER TABLE membership_types
  ADD COLUMN IF NOT EXISTS price_amount numeric(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency varchar(3) NOT NULL DEFAULT 'ETB';

ALTER TABLE membership_applications
  ADD COLUMN IF NOT EXISTS outlet_or_institution varchar(200),
  ADD COLUMN IF NOT EXISTS current_position varchar(150),
  ADD COLUMN IF NOT EXISTS region_or_chapter varchar(150);

UPDATE membership_applications
SET
  outlet_or_institution = COALESCE(outlet_or_institution, 'Not provided'),
  current_position = COALESCE(current_position, 'Not provided'),
  region_or_chapter = COALESCE(region_or_chapter, 'Not provided');

ALTER TABLE membership_applications
  ALTER COLUMN outlet_or_institution SET NOT NULL,
  ALTER COLUMN current_position SET NOT NULL,
  ALTER COLUMN region_or_chapter SET NOT NULL,
  ALTER COLUMN address DROP NOT NULL,
  ALTER COLUMN motivation DROP NOT NULL;

INSERT INTO membership_types (
  id, name, description, requirements, price_amount, currency, is_active
)
VALUES
  (
    '00000000-0000-4000-8000-000000000001',
    'Associate',
    'Journalism students and first-year professionals',
    'For students and professionals in their first year.',
    0,
    'ETB',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    'Full Member',
    'Working women journalists, producers, and editors',
    'For working women journalists, producers, and editors.',
    800,
    'ETB',
    true
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    'Institutional',
    'Newsrooms, universities, and media organizations',
    'For newsrooms, universities, and media organizations.',
    15000,
    'ETB',
    true
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  price_amount = EXCLUDED.price_amount,
  currency = EXCLUDED.currency,
  is_active = true,
  updated_at = now();
