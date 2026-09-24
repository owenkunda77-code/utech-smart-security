-- DPO-first payment schema for Zambia
-- Run in Supabase SQL editor.

create table if not exists payment_providers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into payment_providers (code, name, config)
values
  ('dpo', 'DPO Zambia', '{"currency":"ZMW","country":"ZM","type":"gateway"}'::jsonb),
  ('mtn_momo', 'MTN Mobile Money', '{"currency":"ZMW","country":"ZM","type":"mobile_money"}'::jsonb),
  ('airtel_money', 'Airtel Money', '{"currency":"ZMW","country":"ZM","type":"mobile_money"}'::jsonb),
  ('zamtel_kwacha', 'Zamtel Kwacha', '{"currency":"ZMW","country":"ZM","type":"mobile_money"}'::jsonb)
on conflict (code) do nothing;

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
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table subscriptions add column if not exists user_id uuid references auth.users(id);
alter table subscriptions add column if not exists payment_id uuid references payments(id);
alter table subscriptions add column if not exists renewal_date timestamptz;
alter table subscriptions add column if not exists auto_renew boolean not null default false;

alter table payments enable row level security;
alter table payment_providers enable row level security;

create policy "Users can view their own payments" on payments for select to authenticated using (user_id = auth.uid());
create policy "Public can read active providers" on payment_providers for select using (active = true);
