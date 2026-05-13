-- 001_create_core_tables.sql
-- Core schema for CivicConnect (Supabase/Postgres)

/*
  Notes:
  - Uses pgcrypto for gen_random_uuid()
  - Uses tsvector generated column for ticket search
  - Row-level security policies provided as examples for Supabase; adapt role checks to your auth mapping
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ENUMs
DO $$ BEGIN
  CREATE TYPE role_type AS ENUM ('resident','staff','department_admin','super_admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('submitted','under_review','assigned','in_progress','resolved','closed','escalated');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE permit_status AS ENUM ('draft','submitted','verification','inspection','approved','rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE priority_level AS ENUM ('low','medium','high','critical','emergency');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE event_status AS ENUM ('draft','published','cancelled','expired');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  contact_email text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Users (application profile mapping to Supabase auth users via auth_uid)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid uuid UNIQUE, -- map to supabase auth user id
  email text UNIQUE,
  full_name text,
  role role_type NOT NULL DEFAULT 'resident',
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  phone text,
  avatar_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- SLA rules
CREATE TABLE IF NOT EXISTS sla_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  priority priority_level NOT NULL,
  response_hours int NOT NULL,
  resolution_hours int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code text UNIQUE, -- e.g. INF-2026-00412
  title text NOT NULL,
  description text,
  reporter_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reporter_auth_uid uuid, -- additional mapping to auth.uid()
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  ai_category text,
  ai_priority priority_level,
  priority priority_level DEFAULT 'medium',
  status ticket_status DEFAULT 'submitted',
  assigned_to uuid REFERENCES users(id) ON DELETE SET NULL,
  sla_due_at timestamptz,
  is_duplicate boolean DEFAULT FALSE,
  duplicate_of uuid REFERENCES tickets(id) ON DELETE SET NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(description,'')), 'B')
  ) STORED
);

-- Ticket comments / timeline
CREATE TABLE IF NOT EXISTS ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  body text NOT NULL,
  public boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  payload jsonb NOT NULL,
  read boolean DEFAULT false,
  channel text DEFAULT 'in-app',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Permits
CREATE TABLE IF NOT EXISTS permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permit_type text NOT NULL,
  applicant_id uuid REFERENCES users(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  data jsonb DEFAULT '{}'::jsonb,
  status permit_status DEFAULT 'draft',
  draft boolean DEFAULT true,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  is_public boolean DEFAULT true,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  organizer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  capacity int DEFAULT 0,
  status event_status DEFAULT 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  location jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Event registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text DEFAULT 'registered',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Analytics snapshots (pre-aggregated)
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit log for ticket status/history
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  action text NOT NULL,
  actor_id uuid,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_department ON tickets (department_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_search ON tickets USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets (priority);
CREATE INDEX IF NOT EXISTS idx_comments_ticket ON ticket_comments (ticket_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, read);

-- Trigger: update updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER trg_set_timestamp_tickets
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER trg_set_timestamp_permits
BEFORE UPDATE ON permits
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Row Level Security (RLS) examples for Supabase
-- NOTE: These are starter policies. Adapt to your exact auth role mapping and security needs.

-- Enable RLS on key tables
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: allow users to select their own profile
CREATE POLICY users_select_own ON users FOR SELECT
USING (auth.uid() = auth_uid OR exists (select 1 from users u where u.auth_uid = auth.uid() and u.role = 'super_admin'));

-- Policy: allow insert if auth.uid() matches reporter_auth_uid (residents creating tickets)
CREATE POLICY tickets_insert_resident ON tickets FOR INSERT
WITH CHECK (reporter_auth_uid = auth.uid());

-- Policy: allow reporters to select their own tickets
CREATE POLICY tickets_select_reporter ON tickets FOR SELECT
USING (reporter_auth_uid = auth.uid() OR exists (select 1 from users u where u.auth_uid = auth.uid() and u.role IN ('staff','department_admin','super_admin') ) );

-- Policy: allow staff & admins to update tickets (department-scoped staff allowed)
CREATE POLICY tickets_update_staff ON tickets FOR UPDATE
USING (exists (select 1 from users u where u.auth_uid = auth.uid() and u.role IN ('staff','department_admin','super_admin')))
WITH CHECK (true);

-- Comments: allow insert if author auth uid matches
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY comments_insert ON ticket_comments FOR INSERT
WITH CHECK (exists (select 1 from users u where u.auth_uid = auth.uid() and u.id = NEW.author_id) );

-- End of migration



