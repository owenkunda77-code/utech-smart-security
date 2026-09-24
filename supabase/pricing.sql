-- Additive central pricing configuration.
-- Verification, registration, certificate, referral-share, and plan prices can
-- be changed here without changing screen code. Restrict updates to admins or
-- a server-side function in production.
create table if not exists price_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  amount integer not null check (amount >= 0),
  currency text not null default 'ZMW',
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

insert into price_settings (key, amount) values
('verification', 25),
('registration', 0),
('certificate', 0),
('referralShare', 0),
('FREE', 0),
('ECONOMY', 25),
('STANDARD', 75),
('ADVANCED', 100),
('PREMIUM', 150)
on conflict (key) do nothing;

alter table price_settings enable row level security;

-- Public clients may read active prices. Do not add a public update policy.
create policy "Anyone can read active prices"
on price_settings for select
using (active = true);

-- Update prices only through a protected admin Edge Function/service role.
