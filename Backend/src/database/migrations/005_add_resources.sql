CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(200) NOT NULL,
  description text NOT NULL,
  category varchar(100) NOT NULL,
  file_url text NOT NULL,
  original_filename text NOT NULL,
  mime_type varchar(150) NOT NULL,
  file_size bigint NOT NULL CHECK (file_size > 0),
  is_published boolean NOT NULL DEFAULT false,
  uploaded_by uuid NOT NULL REFERENCES admins(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS resources_published_created_idx
  ON resources(is_published, created_at DESC);
