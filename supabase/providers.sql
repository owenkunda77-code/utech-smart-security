-- Provider configuration and transaction ledgers
-- Run this in the Supabase SQL editor to set up multi-provider payment support

-- Central provider configuration
create table if not exists payment_providers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  api_endpoint text not null,
  webhook_path text not null,
  active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Provider credentials (secrets stored server-side only, never in client)
-- Store actual API keys in Supabase secrets, reference by provider_code here for audit
create table if not exists provider_credentials (
  id uuid primary key default gen_random_uuid(),
  provider_code text not null references payment_providers(code),
  credential_key text not null,
  credential_value text not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Real payment ledger with provider tracking
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  device_id text not null,
  plan text not null,
  amount integer not null check (amount >= 0),
  currency text not null default 'ZMW',
  provider_code text not null references payment_providers(code),
  phone_number text,
  provider_reference text,
  idempotency_key text unique not null,
  status text not null default 'pending' check (status in ('pending','processing','confirmed','failed','cancelled','reconciled')),
  failure_reason text,
  provider_response jsonb not null default '{}'::jsonb,
  retry_count integer not null default 0,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Payment retry log for diagnostics
create table if not exists payment_retries (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id),
  attempt_number integer not null,
  provider_response jsonb not null,
  http_status integer,
  error_message text,
  created_at timestamptz not null default now()
);

-- Webhook log for audit and debugging
create table if not exists webhook_logs (
  id uuid primary key default gen_random_uuid(),
  provider_code text not null references payment_providers(code),
  webhook_event_id text unique,
  payload jsonb not null,
  signature_valid boolean not null,
  payment_id uuid references payments(id),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

-- Update subscriptions to track payment source
alter table subscriptions add column if not exists user_id uuid references auth.users(id);
alter table subscriptions add column if not exists payment_id uuid references payments(id);
alter table subscriptions add column if not exists renewal_date timestamptz;
alter table subscriptions add column if not exists auto_renew boolean not null default false;

alter table payments enable row level security;
alter table payment_providers enable row level security;
alter table payment_retries enable row level security;
alter table webhook_logs enable row level security;

-- RLS Policies
create policy "Users can view their own payments" on payments for select to authenticated using (user_id = auth.uid());
create policy "Public can read active providers" on payment_providers for select using (active = true);

-- Insert provider configurations (customize endpoints and webhook paths for your Zambia setup)
insert into payment_providers (code, name, api_endpoint, webhook_path, config) values
  ('mtn_momo', 'MTN Mobile Money', 'https://api.mtn.co.zm/v1/collection', '/functions/v1/payment-webhook/mtn', '{"currency":"ZMW","country":"ZM"}'::jsonb),
  ('airtel_money', 'Airtel Money', 'https://api.airtel.co.zm/v1/payment', '/functions/v1/payment-webhook/airtel', '{"currency":"ZMW","country":"ZM"}'::jsonb),
  ('zamtel_kwacha', 'Zamtel Kwacha', 'https://api.zamtel.co.zm/v1/debit', '/functions/v1/payment-webhook/zamtel', '{"currency":"ZMW","country":"ZM"}'::jsonb),
  ('card_stripe', 'Card / Bank (Stripe)', 'https://api.stripe.com/v1/payment_intents', '/functions/v1/payment-webhook/stripe', '{"currency":"ZMW","country":"ZM"}'::jsonb)
on conflict (code) do nothing;
