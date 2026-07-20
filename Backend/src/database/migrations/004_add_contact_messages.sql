CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name varchar(150) NOT NULL,
  email varchar(320) NOT NULL,
  subject varchar(200) NOT NULL CHECK (
    subject IN (
      'Membership',
      'Partnership',
      'Media enquiry',
      'Programme collaboration',
      'Other'
    )
  ),
  message text NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'NEW' CHECK (
    status IN ('NEW', 'READ', 'ARCHIVED')
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_status_created_idx
  ON contact_messages(status, created_at DESC);
