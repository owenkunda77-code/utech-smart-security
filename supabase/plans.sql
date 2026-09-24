-- Additive schema for the plans screen. Run this after the existing Supabase tables.
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  amount integer not null check (amount >= 0),
  features jsonb not null default '[]'::jsonb,
  required_permissions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  plan text not null,
  amount integer not null check (amount >= 0),
  features jsonb not null default '[]'::jsonb,
  permissions_granted jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

insert into plans (name, amount, features, required_permissions) values
('LEAD / FREE', 0, '[1,2,3]', '[]'),
('BASIC', 25, '[1,2,3,4,10,11,12]', '["location"]'),
('STANDARD', 75, '[1,2,3,4,5,6,7,10,11,12,13]', '["location","sensors"]'),
('PREMIUM', 150, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14]', '["camera","location","sensors","microphone"]')
on conflict (name) do update set amount = excluded.amount, features = excluded.features, required_permissions = excluded.required_permissions;

-- Enable RLS and allow writes only through an authenticated server-side flow in production.
alter table plans enable row level security;
alter table subscriptions enable row level security;
