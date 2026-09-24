# Payment Provider Integration for U-TECH Smart Security

## Setup Instructions

### 1. Database Configuration

Run the following SQL scripts in your Supabase SQL Editor in order:
1. `supabase/providers.sql` — Creates provider tables and payment ledger
2. `supabase/payments.sql` — Adds columns to subscriptions table (optional if providers.sql is sufficient)

### 2. Environment Secrets

Add the following secrets to your Supabase Edge Functions environment via the Supabase dashboard:

#### MTN Mobile Money
```
MTN_API_KEY=your_mtn_api_key
MTN_API_SECRET=your_mtn_api_secret
MTN_INITIATOR_ID=your_mtn_initiator_id
MTN_WEBHOOK_SECRET=your_mtn_webhook_secret
```

#### Airtel Money
```
AIRTEL_CLIENT_ID=your_airtel_client_id
AIRTEL_CLIENT_SECRET=your_airtel_client_secret
AIRTEL_WEBHOOK_SECRET=your_airtel_webhook_secret
```

#### Zamtel Kwacha
```
ZAMTEL_MERCHANT_ID=your_zamtel_merchant_id
ZAMTEL_API_KEY=your_zamtel_api_key
ZAMTEL_WEBHOOK_SECRET=your_zamtel_webhook_secret
```

#### Stripe (Card/Bank)
```
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 3. Deploy Edge Functions

Deploy the two Edge Functions to your Supabase project:
```bash
supabase functions deploy create-payment
supabase functions deploy payment-webhook
```

### 4. Configure Provider Webhooks

For each provider, register the webhook URL in their developer console:
- **MTN**: `https://your-project.supabase.co/functions/v1/payment-webhook/mtn`
- **Airtel**: `https://your-project.supabase.co/functions/v1/payment-webhook/airtel`
- **Zamtel**: `https://your-project.supabase.co/functions/v1/payment-webhook/zamtel`
- **Stripe**: `https://your-project.supabase.co/functions/v1/payment-webhook/stripe`

### 5. Test in Sandbox

1. Each provider has a sandbox/test environment. Start there.
2. Test with mock phone numbers or test card numbers from the provider.
3. Verify that:
   - Payment requests are created in the `payments` table with `status='pending'`
   - Provider responses are logged in `provider_response` JSON
   - Webhook callbacks successfully update `status='confirmed'`
   - Subscriptions are created only after confirmed payment

### 6. Go Live

Once sandbox testing passes:
1. Update secrets with production credentials
2. Redeploy Edge Functions
3. Verify webhooks are configured to production URLs
4. Enable auto-renewal billing (optional) via `subscriptions.auto_renew` flag

## Mobile App Integration

The app now:
1. Collects device ID, phone number, and provider choice
2. Sends a payment request to `create-payment` Edge Function
3. Displays a confirmation message to check their phone
4. Does NOT activate the subscription until the provider webhook confirms payment
5. Logs all payment attempts and outcomes in the database

## Audit & Diagnostics

- **`payments` table**: Full ledger of all payment attempts, including failures and retries
- **`provider_response` JSON**: Raw API response from each provider
- **`payment_retries` table**: Tracks automatic retry attempts
- **`webhook_logs` table**: Logs all incoming webhooks, signature validation, and processing status

Use these tables to debug failed payments, verify reconciliation, and ensure no double-charging.

## Security Notes

✅ **Do:**
- Store all provider API keys and secrets in Supabase secrets, never in client code or committed files
- Verify webhook signatures before processing
- Use idempotency keys to prevent duplicate charges
- Log all payment events for audit trails
- Use Row-Level Security (RLS) policies to restrict payment table access to authenticated users
- Test signature verification in sandbox before going live

❌ **Don't:**
- Store CVVs, card numbers, or mobile-money PINs in the database
- Trust client-submitted amounts; always verify against `price_settings`
- Process payments without webhook confirmation
- Expose provider credentials in mobile app code
- Skip sandbox testing

## Recurring/Auto-Renewal Billing (Optional Future Phase)

Once basic payment flow is stable:
1. Store provider mandate/token references in `payments` table
2. Add a scheduled Edge Function to charge at renewal date
3. Update `subscriptions.renewal_date` and `auto_renew` flag
4. Send SMS/push notification before renewal
5. Handle failed renewal gracefully (notification, grace period, suspension)
