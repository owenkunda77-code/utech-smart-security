-- Additive schema for the security feature expansion.
-- Apply after the existing schema and review each RLS policy for your auth model.

create table if not exists asset_owners (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  user_id uuid,
  verification_status text not null default 'PENDING',
  evidence jsonb not null default '[]'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists security_cases (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  case_number text unique not null,
  type text not null,
  status text not null default 'OPEN',
  severity text not null default 'CRITICAL',
  assigned_to uuid,
  notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  device_id text not null,
  name text not null,
  phone text not null,
  email text,
  escalation_order integer not null default 1,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists geofences (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  name text not null,
  center_lat numeric not null,
  center_lng numeric not null,
  radius_m integer not null check (radius_m > 0),
  schedule jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists security_events (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  event_type text not null,
  severity text not null default 'INFO',
  latitude numeric,
  longitude numeric,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  event_id uuid references security_events(id),
  severity text not null,
  channel text not null,
  recipient text not null,
  status text not null default 'PENDING',
  acknowledged_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  certificate_number text unique not null,
  status text not null default 'VALID',
  score integer check (score between 0 and 100),
  verification_reference text,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revocation_reason text
);

create table if not exists evidence_files (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  case_id uuid references security_cases(id),
  storage_path text not null,
  sha256 text,
  uploaded_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  resource_type text not null,
  resource_id text,
  device_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  device_id text,
  consent_type text not null,
  granted boolean not null,
  version text not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz
);

create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null,
  resource_id uuid not null,
  token_hash text unique not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists security_scores (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  score integer not null check (score between 0 and 100),
  explanation jsonb not null default '{}'::jsonb,
  calculated_at timestamptz not null default now()
);

alter table asset_owners enable row level security;
alter table security_cases enable row level security;
alter table trusted_contacts enable row level security;
alter table geofences enable row level security;
alter table security_events enable row level security;
alter table alerts enable row level security;
alter table certificates enable row level security;
alter table evidence_files enable row level security;
alter table audit_logs enable row level security;
alter table consent_records enable row level security;
alter table share_links enable row level security;
alter table security_scores enable row level security;

-- Add explicit policies for your auth roles before exposing these tables to clients.
-- Do not use a public write policy for statuses, certificates, payments, or audit logs.
