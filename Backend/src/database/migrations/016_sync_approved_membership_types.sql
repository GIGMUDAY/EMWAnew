-- Synchronize active membership categories with the latest EMWA-approved form.
UPDATE membership_types
SET
  name = 'Full Member',
  description = 'Women media practitioners with at least one year of experience in journalism.',
  requirements = 'Open to women with at least one year of journalism experience.',
  price_amount = 600,
  currency = 'ETB',
  is_active = true,
  updated_at = now()
WHERE id = '00000000-0000-4000-8000-000000000002';

UPDATE membership_types
SET
  name = 'Associate',
  description = 'Male journalists, journalism students, and practicing journalists without formal journalism education.',
  requirements = 'Open to male media professionals, journalism students, and practicing journalists without formal journalism education.',
  price_amount = 300,
  currency = 'ETB',
  is_active = true,
  updated_at = now()
WHERE id = '00000000-0000-4000-8000-000000000001';

UPDATE membership_types
SET
  name = 'Honorary Member',
  description = 'Individuals interested in providing financial, in-kind, or other forms of support.',
  requirements = 'For individuals who support EMWA financially, in kind, or through another form of contribution.',
  price_amount = 0,
  currency = 'ETB',
  is_active = true,
  updated_at = now()
WHERE id = '00000000-0000-4000-8000-000000000004';
