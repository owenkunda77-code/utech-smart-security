# Security Feature Expansion

## Scope

This document defines the complete security expansion for **Light Smart Asset Security by U-TECH Enterprise**. The features are additive: existing screens, plans, README content, and tables must be preserved.

## Trust and ownership

- Owner identity and KYC verification
- Proof-of-ownership uploads for receipts, registration documents, and serial-number evidence
- Duplicate device identity detection
- Immutable device identity after approval, with an audited transfer workflow
- Transfer of ownership requiring approval from the current owner and U-TECH
- Device registration history and certificate history

## Stolen-asset recovery

- Instant stolen mode with an incident case number
- Trusted contacts and emergency escalation
- Last-known location timeline
- Movement history with timestamps
- Tamper, tracker-unplugged, SIM-change, low-battery, offline, and geofence alerts
- Time-based geofences for home, office, school, farm, and other safe zones
- Recovery case management with evidence, notes, assignees, and status
- Jamming/interference detection where supported by the tracker hardware

## Evidence and certificates

- Tamper-evident event log
- Incident report export with maps, timestamps, device identity, and references
- Police report and insurance claim letter generation
- Evidence photo and document uploads
- Secure, expiring share links for police, insurers, or authorized contacts
- Public certificate verification page and QR code
- Certificate revocation when an asset is later reported stolen

## Alerts and escalation

- Info, warning, and critical severity levels
- Push, SMS, email, and WhatsApp provider adapters
- Alert acknowledgement and delivery tracking
- Escalation when a critical alert is not acknowledged
- Rules for after-hours movement, unexpected movement, SIM changes, offline duration, and failed logins
- Notification preferences per owner, trusted contact, and organization

## Administration

- Multi-factor authentication
- Role-based access control for owners, agents, investigators, finance, and super-admins
- Admin approval for changing clean/stolen status
- Two-person approval for sensitive actions
- Complete audit log
- Session and device management
- Admin login anomaly, IP, and device alerts
- Rate limiting, lockout, and abuse monitoring

## Privacy and consent

- Explicit consent for camera, microphone, and location features
- Visible indicators while sensitive features are active
- Owner-controlled start and stop controls
- No covert recording or tracking
- Encryption in transit and at rest
- Configurable retention and automated deletion
- Personal-data export and deletion requests
- Separate consent for police and insurer sharing
- Privacy policy, terms acceptance, and access logs

## Zambia-focused reliability

- Offline-first experience and low-data mode
- SMS fallback for critical alerts
- MTN, Airtel, and Zamtel notification adapters
- Battery-efficient tracking
- Correct Zambia date/time handling
- Retry queue for failed uploads
- Cached last-known status
- Delayed mobile-money payment reconciliation

## Product differentiation

- Explainable Asset Security Score
- QR and NFC labels with a privacy-preserving found-asset workflow
- Multi-asset family and business dashboard
- Insurance integration based on verified certificates
- Fraud detection for duplicate devices, certificates, searches, and admin activity
- English-first interface with support for selected Zambian languages
- Public found-asset reporting without exposing owner contact details
- Security health reminders

## Implementation rules

1. Sensitive actions must be authorized server-side; never trust client-submitted status, permissions, prices, or certificate data.
2. Camera, microphone, and location access must be visible, consent-based, and revocable.
3. Never store mobile-money PINs, card CVVs, provider secrets, or raw authentication tokens in client tables.
4. Every status change, certificate action, payment event, location access, and admin action must have an audit record.
5. Use feature flags so unfinished integrations cannot appear active to customers.
6. Provider adapters must report pending, confirmed, failed, and reconciled payment states.
7. Add tests for authorization, duplicate identities, certificate revocation, retention, and notification escalation before production release.

## Delivery phases

### Phase 1 — trust and core security

MFA, roles, audit logs, ownership verification, certificate verification/revocation, clean/stolen approval, encryption, and Supabase RLS.

### Phase 2 — recovery

Movement timeline, geofences, tamper/offline alerts, SMS fallback, evidence, police/insurance reports, trusted contacts, and escalation.

### Phase 3 — differentiation

Asset Security Score, QR/NFC labels, business dashboard, fraud detection, insurance integration, and offline-first support.
