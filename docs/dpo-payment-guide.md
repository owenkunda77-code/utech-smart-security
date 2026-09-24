# DPO-first payment flow

This repository is being adapted for a Zambia-first payment strategy:

- Primary provider: DPO
- Mobile money support: MTN, Airtel, Zamtel
- Local currency: ZMW
- Server-side confirmation via Supabase Edge Functions and provider webhooks

## What to do in production

1. Create a DPO merchant account in Zambia
2. Get the DPO API credentials and webhook secret
3. Add them to Supabase functions secrets
4. Keep the frontend app free of raw secrets and token data
5. Use DPO as the primary processor for cards and mobile-money style checkout
6. Use mobile-money-specific providers if DPO does not cover the full wallet flow for your business model

## Recommended architecture

App -> Supabase Edge Function -> DPO API -> DPO webhook -> Supabase payments table -> activate subscription

## Important rules

- Never trust the amount sent by the app
- Always validate against `price_settings`
- Never store CVV or PINs
- Activate subscription only after payment confirmation
- Log every payment attempt and webhook response
