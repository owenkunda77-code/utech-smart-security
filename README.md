# Light Smart Asset Security

A comprehensive GPS tracking, monitoring, and recovery platform for valuable assets (phones, laptops, vehicles, motorcycles, pumps, and other tagged assets).

**By U-Tech Enterprise**

**Tagline**: Verify Your Assets | Check the Stolen Database | Get a Safety Certificate

## Product Requirements

This repository contains the requirements and implementation specification for the existing U-Tech project. The application must be extended in place; do not create a separate project or repository.

### Brand and Theme

- Product name: **Light Smart Asset Security**
- Company credit: **by U-Tech Enterprise**
- Primary background blue: `#0A3D8A`
- Action blue: `#0A84FF`
- Supporting theme: white cards, white text, and a clean blue-and-white interface

### First Page — `app/index.js`

The first page should use a `#0A3D8A` background and contain:

- Large white title: **Light Smart Asset Security**
- Small subtitle: **by U-Tech Enterprise**
- Description: **Verify Your Assets | Phones, Laptops, Vehicles, Pumps | Check Stolen Database | Get Safety Certificate**
- Three buttons in this order:
  1. **VERIFY** — largest button, `#0A84FF`, navigates to `/verify`
  2. **LOGIN** — white outline button, navigates to `/login`
  3. **REGISTER** — white text link, navigates to `/register`
- Hidden admin control in the bottom-right corner. A 3-second long press must request the key `UTECH_ADMIN_2025`; on successful verification it navigates to `/admin`.

### Full Verification Flow — `app/verify.js`

Use white cards on the blue background.

#### Step 1 — Enter Device Identity

- Title: **Verify Asset**
- Label: **Enter Device Identity Code (IMEI / Serial / Engine No / Asset Tag)**
- Input field name: `device_id`
- **CONTINUE** button in `#0A84FF`
- Continuing advances to Step 2.

#### Step 2 — Choose Payment Method

- Title: **Choose Payment Method for Verification Fee**
- Display four large selectable cards with icons:
  - MTN Mobile Money
  - Airtel Money
  - Zamtel Kwacha
  - Card / Bank
- Save the selected value as `paymentMethod` and advance to Step 3.

#### Step 3 — Enter Payment Details

- Title: **Enter Number to Pay From**
- For MTN, Airtel, or Zamtel: show **Mobile Number for payment e.g 076xxxxxxx**
- For Card / Bank: show Card Number, Expiry, and CVV fields
- **PAY NOW - K25** button in `#0A84FF`
- While processing, display: **Initiating payment... Check your phone for PIN prompt**
- Payment initiation should call a Supabase Edge Function such as `initiatePayment(phone, amount=25, method)`.
- The Edge Function is responsible for securely integrating the applicable MTN MoMo, Airtel Money, Zamtel, or card provider and triggering the provider's authorization prompt.
- Never store mobile-money PINs, card CVV values, or secret provider credentials in the client application.
- After successful confirmation, save a record to the Supabase `payments` table with:
  - `device_id`
  - `phone`
  - `method`
  - `amount` (`25`)
  - `status` (`success`)
- On failure, display: **Payment Failed**.
- Do not report payment success until the server/provider confirms it. A simulator may be used for development until production provider credentials are configured.

#### Step 4 — Search and Result

- Initially display: **Searching Database...**
- Search the registered asset/stolen-asset database using the submitted `device_id`.
- Show a clear result indicating whether the asset is:
  - **SAFE / NOT REPORTED STOLEN**, or
  - **REPORTED STOLEN / FLAGGED**
- Display the asset identity, search timestamp, and payment reference where appropriate.
- Only a successful payment and a clear database result may allow certificate generation.

### Safety Certificate

For an asset that passes verification:

- Provide a downloadable or printable **Safety Certificate**.
- Include:
  - Light Smart Asset Security branding
  - U-Tech Enterprise attribution
  - Device identity code
  - Verification date and time
  - Verification status
  - Unique certificate/reference number
  - QR code or verification link when supported
- Store certificate metadata in Supabase and provide a way to verify the certificate later.
- Do not issue a safety certificate for an asset marked stolen or flagged.

## Existing Features

- 📱 Asset Registration & Management (Phones, Laptops, Vehicles, Motorcycles, Pumps)
- 🎯 Real-time GPS Tracking & Live Location Monitoring
- 🚨 Geofence & Movement Alerts
- 💳 Tiered Subscription Plans (Economy, Standard, Advanced, Premium)
- 👤 User Registration & KYC Verification
- 💰 Payment Processing & Notifications (Mobile Money, Card Payment)
- 📊 Admin Dashboard & Asset Management
- 🔔 Real-time Notifications & Alerts
- 🗺️ Interactive Live Tracking Map
- 📜 Verification payment receipts and safety certificates

## App Flow

1. **Welcome Screen** - Verify, Login, or Register
2. **Enter Device Identity** - Submit IMEI, serial, engine number, or asset tag
3. **Choose Payment Method** - Select mobile money or card/bank
4. **Complete Verification Payment** - Pay the K25 fee securely
5. **Search Database** - Check the submitted asset identity
6. **View Result** - Show safe or stolen/flagged status
7. **Download Certificate** - Issue a certificate only for successful clear verification
8. **Create Account** - User Registration (Name, Phone, Email, Address, Emergency Contact)
9. **Register Asset/Device** - Choose asset type and add details
10. **Live Tracking** - View real-time asset location and status

## Subscription Plans

| Plan | Price | Devices | Features |
|------|-------|---------|----------|
| **Economy** | K30/month | 1 | Basic tracking |
| **Standard** | K60/month | Multiple | Enhanced features |
| **Advanced** | K100/month | Multiple | GPS + Alerts |
| **Premium** | Custom | Unlimited | Full Protection Package |

## Project Structure

```
utech-smart-security/
├── app/                   # Application screens and routes
│   ├── index.js           # Landing page and navigation
│   └── verify.js          # Verification and payment flow
├── frontend/              # React Native/mobile frontend (if applicable)
├── backend/               # Node.js/Express API
├── supabase/              # Database schema and Edge Functions
├── database/              # Database schemas
├── docs/                  # Project documentation
└── README.md
```

## Technology Stack

- **Frontend**: React Native (iOS/Android) or React
- **Backend**: Node.js, Express.js
- **Database**: Supabase/PostgreSQL
- **Authentication**: JWT or Supabase Auth
- **Real-time**: WebSocket for live tracking
- **Payments**: MTN Mobile Money, Airtel Money, Zamtel Kwacha, Card/Bank through secure server-side integrations
- **Maps**: Google Maps API or Mapbox
- **Notifications**: Push Notifications (FCM/APNs)
- **Certificates**: Server-generated PDF/printable certificate with a unique verification reference

## Security Requirements

- Keep payment provider secrets in server-side environment variables or Supabase secrets.
- Never expose API keys, card CVV values, or mobile-money PINs in the client.
- Validate and sanitize all device identity and payment inputs.
- Use provider callbacks/webhooks or server-side polling to confirm payment status.
- Apply row-level security to payments, assets, and certificates in Supabase.
- Record an audit trail for searches, payments, database status changes, and certificate issuance.
- Do not allow clients to change payment status or asset safety status directly.

## Installation & Setup

See individual documentation:

- Frontend setup: `frontend/README.md`
- Backend setup: `backend/README.md`
- Database setup: `database/README.md`
- Supabase Edge Functions and payment provider setup: `supabase/README.md`

Production payment processing requires approved provider accounts, API credentials, webhook configuration, and a Supabase project. Until those are configured, use a clearly labelled test/sandbox integration rather than claiming a real payment succeeded.

## License

MIT License - See LICENSE file for details

## Location

Lusaka, Zambia

---

**Thank you for choosing Light Smart Asset Security!** 🛡️
