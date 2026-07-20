CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar(320) NOT NULL UNIQUE,
  status varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (
    status IN ('ACTIVE', 'UNSUBSCRIBED')
  ),
  source varchar(80) NOT NULL DEFAULT 'website_home',
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_created_idx
  ON newsletter_subscribers(status, created_at DESC);
