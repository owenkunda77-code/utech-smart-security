# Payment setup

The mobile app now sends paid plan requests to the `create-payment` Supabase Edge Function. It no longer uses simulated success or activates paid subscriptions before confirmation.

Before live use:

1. Run `supabase/payments.sql` in the Supabase SQL editor.
2. Deploy `supabase/functions/create-payment` and `supabase/functions/payment-webhook`.
3. Configure a real Zambia payment provider endpoint and secrets as Edge Function secrets:
   - `PAYMENT_PROVIDER_URL`
   - `PAYMENT_PROVIDER_API_KEY`
   - `PAYMENT_WEBHOOK_SECRET`
4. Configure the provider webhook URL to point to `payment-webhook`.
5. Test with the provider sandbox first, then switch to production credentials.

The provider must support a mobile-money collection request and webhook/callback confirmation. Until those secrets and provider details are configured, paid transactions are deliberately rejected rather than falsely marked successful.
