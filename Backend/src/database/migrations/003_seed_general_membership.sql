INSERT INTO membership_types (
  id,
  name,
  description,
  requirements,
  is_active
)
VALUES (
  '00000000-0000-4000-8000-000000000001',
  'General Membership',
  'General membership for individuals who support the organization.',
  'Applicant must provide valid contact information and explain their motivation.',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  requirements = EXCLUDED.requirements,
  is_active = true,
  updated_at = now();
