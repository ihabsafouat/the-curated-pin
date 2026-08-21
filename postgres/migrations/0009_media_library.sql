CREATE TABLE IF NOT EXISTS media_upload_authorizations (
  public_id VARCHAR(320) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(240) NOT NULL DEFAULT '',
  declared_mime VARCHAR(64) NOT NULL,
  declared_bytes BIGINT NOT NULL CHECK (declared_bytes > 0),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS media_upload_authorizations_user_idx ON media_upload_authorizations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS media_upload_authorizations_expiry_idx ON media_upload_authorizations(expires_at) WHERE consumed_at IS NULL;

CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY,
  provider VARCHAR(24) NOT NULL DEFAULT 'cloudinary' CHECK (provider IN ('cloudinary')),
  public_id VARCHAR(320) NOT NULL UNIQUE,
  version BIGINT NOT NULL,
  secure_url TEXT NOT NULL,
  format VARCHAR(16) NOT NULL,
  bytes BIGINT NOT NULL CHECK (bytes >= 0),
  width INTEGER NOT NULL CHECK (width > 0),
  height INTEGER NOT NULL CHECK (height > 0),
  original_filename VARCHAR(240) NOT NULL DEFAULT '',
  alt_text VARCHAR(320) NOT NULL DEFAULT '',
  caption VARCHAR(500) NOT NULL DEFAULT '',
  credit VARCHAR(240) NOT NULL DEFAULT '',
  license_note VARCHAR(240) NOT NULL DEFAULT '',
  tags_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS media_assets_status_created_idx ON media_assets(status, created_at DESC);
CREATE INDEX IF NOT EXISTS media_assets_uploaded_by_idx ON media_assets(uploaded_by, created_at DESC);
CREATE INDEX IF NOT EXISTS media_assets_public_id_idx ON media_assets(public_id);
