UPDATE membership_types
SET
  description = 'Women with at least one year of journalism experience',
  requirements = 'At least one year of experience in journalism.',
  price_amount = 600,
  currency = 'ETB',
  is_active = true,
  updated_at = now()
WHERE id = '00000000-0000-4000-8000-000000000002';

UPDATE membership_types
SET
  description = 'Male journalists, journalism students, and practicing journalists without formal journalism education',
  requirements = 'Open to male media professionals, journalism students, and practicing journalists without formal journalism education.',
  price_amount = 300,
  currency = 'ETB',
  is_active = true,
  updated_at = now()
WHERE id = '00000000-0000-4000-8000-000000000001';

UPDATE membership_types
SET is_active = false, updated_at = now()
WHERE name = 'Institutional';

INSERT INTO membership_types (
  id, name, description, requirements, price_amount, currency, is_active
)
SELECT
  '00000000-0000-4000-8000-000000000004',
  'Honorary Member',
  'Individuals interested in providing financial, in-kind, or other support',
  'For individuals who support EMWA financially, in kind, or through another form of contribution.',
  0,
  'ETB',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM membership_types WHERE lower(name) = lower('Honorary Member')
);

UPDATE membership_types
SET
  description = 'Individuals interested in providing financial, in-kind, or other support',
  requirements = 'For individuals who support EMWA financially, in kind, or through another form of contribution.',
  price_amount = 0,
  currency = 'ETB',
  is_active = true,
  updated_at = now()
WHERE lower(name) = lower('Honorary Member');
