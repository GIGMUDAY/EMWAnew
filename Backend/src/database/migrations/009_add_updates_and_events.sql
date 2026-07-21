CREATE TABLE IF NOT EXISTS updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(220) NOT NULL,
  slug varchar(240) NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  content_type varchar(20) NOT NULL CHECK (
    content_type IN ('NEWS', 'PRESS', 'ARTICLE', 'PHOTO', 'VIDEO')
  ),
  featured_image_url text,
  video_url text,
  author_name varchar(150) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK (
    status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')
  ),
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_by uuid NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS updates_slug_unique_ci ON updates(lower(slug));
CREATE INDEX IF NOT EXISTS updates_public_listing_idx
  ON updates(status, published_at DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS updates_type_status_idx
  ON updates(content_type, status, published_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS updates_one_published_featured_idx
  ON updates(is_featured)
  WHERE is_featured = true AND status = 'PUBLISHED';

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(220) NOT NULL,
  slug varchar(240) NOT NULL,
  description text NOT NULL,
  event_type varchar(100) NOT NULL,
  location varchar(240) NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  registration_url text,
  capacity_status varchar(20) NOT NULL DEFAULT 'AVAILABLE' CHECK (
    capacity_status IN ('AVAILABLE', 'AT_CAPACITY', 'CANCELLED')
  ),
  featured_image_url text,
  status varchar(20) NOT NULL DEFAULT 'DRAFT' CHECK (
    status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')
  ),
  created_by uuid NOT NULL REFERENCES admins(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique_ci ON events(lower(slug));
CREATE INDEX IF NOT EXISTS events_public_listing_idx ON events(status, starts_at);
CREATE INDEX IF NOT EXISTS events_type_status_idx ON events(event_type, status, starts_at);
