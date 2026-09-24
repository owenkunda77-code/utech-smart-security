-- Real payment ledger. Apply this in Supabase SQL editor before deploying the Edge Functions.
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  device_id text not null,
  plan text not null,
  amount integer not null check (amount >= 0),
  currency text not null default 'ZMW',
  provider text not null,
  phone_number text,
  provider_reference text unique,
  idempotency_key text unique not null,
  status text not null default 'pending' check (status in ('pending','confirmed','failed','cancelled','reconciled')),
  failure_reason text,
  provider_response jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table payments enable row level security;
create policy "Users can view their own payments" on payments for select to authenticated using (user_id = auth.uid());

-- Keep writes and status changes inside Edge Functions using the service role.
alter table subscriptions add column if not exists user_id uuid references auth.users(id);
alter table subscriptions add column if not exists payment_id uuid references payments(id);
