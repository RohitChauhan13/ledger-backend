BEGIN;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rates (
  id BIGSERIAL PRIMARY KEY,
  awak_private_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  awak_public_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  awak_commission_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  jawak_private_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  jawak_public_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  jawak_commission_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  varning_private_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  varning_public_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  varning_commission_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  dock_awak_private_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  dock_awak_public_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  dock_awak_commission_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  dock_jawak_private_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  dock_jawak_public_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  dock_jawak_commission_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  checkbox_flag_private_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  checkbox_flag_public_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  checkbox_flag_commission_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  panni_private_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  panni_public_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  panni_commission_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  potti_5_private_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  potti_5_public_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  potti_5_commission_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  potti_10_private_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  potti_10_public_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  potti_10_commission_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  solapur_private_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  solapur_public_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  solapur_commission_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  kishan_dock_awak_private_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  kishan_dock_awak_public_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  kishan_dock_awak_commission_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  other_private_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  other_public_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  other_commission_rate NUMERIC(20,6) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entries (
  id BIGSERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  awak NUMERIC(20,2) NOT NULL DEFAULT 0,
  jawak NUMERIC(20,2) NOT NULL DEFAULT 0,
  varning NUMERIC(20,2) NOT NULL DEFAULT 0,
  dock_awak NUMERIC(20,2) NOT NULL DEFAULT 0,
  dock_jawak NUMERIC(20,2) NOT NULL DEFAULT 0,
  checkbox_flag NUMERIC(20,2) NOT NULL DEFAULT 0,
  panni NUMERIC(20,2) NOT NULL DEFAULT 0,
  potti_5 NUMERIC(20,2) NOT NULL DEFAULT 0,
  potti_10 NUMERIC(20,2) NOT NULL DEFAULT 0,
  solapur NUMERIC(20,2) NOT NULL DEFAULT 0,
  kishan_dock_awak NUMERIC(20,2) NOT NULL DEFAULT 0,
  other_value NUMERIC(20,2) NOT NULL DEFAULT 0,
  other_price NUMERIC(20,2),
  private_total NUMERIC(20,2) NOT NULL DEFAULT 0,
  public_total NUMERIC(20,2) NOT NULL DEFAULT 0,
  commission_total NUMERIC(20,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entries_start_date ON entries(start_date);
CREATE INDEX IF NOT EXISTS idx_entries_end_date ON entries(end_date);
CREATE INDEX IF NOT EXISTS idx_entries_date_range ON entries(start_date, end_date);

CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_expire ON session(expire);

-- Seed: default rates row (one global rates config)
INSERT INTO rates (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Seed: default admin user (password: admin123 — CHANGE IN PRODUCTION)
-- bcrypt hash of 'admin123' with 12 rounds
INSERT INTO users (username, password)
VALUES ('admin', '$2b$12$dkUIe3mx5TOnv3c/xFT.g.CYgR6na73xLllJ4TBpd0jhsnWE1EgT6')
ON CONFLICT (username) DO NOTHING;

COMMIT;
