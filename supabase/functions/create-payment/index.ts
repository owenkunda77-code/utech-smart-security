import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Provider configurations with sensitive credentials from Deno secrets
const PROVIDERS = {
  mtn_momo: {
    name: 'MTN Mobile Money',
    endpoint: 'https://api.mtn.co.zm/v1/collection',
    apiKey: Deno.env.get('MTN_API_KEY'),
    apiSecret: Deno.env.get('MTN_API_SECRET'),
    initiatorId: Deno.env.get('MTN_INITIATOR_ID'),
  },
  airtel_money: {
    name: 'Airtel Money',
    endpoint: 'https://api.airtel.co.zm/v1/payment',
    clientId: Deno.env.get('AIRTEL_CLIENT_ID'),
    clientSecret: Deno.env.get('AIRTEL_CLIENT_SECRET'),
  },
  zamtel_kwacha: {
    name: 'Zamtel Kwacha',
    endpoint: 'https://api.zamtel.co.zm/v1/debit',
    merchantId: Deno.env.get('ZAMTEL_MERCHANT_ID'),
    apiKey: Deno.env.get('ZAMTEL_API_KEY'),
  },
  card_stripe: {
    name: 'Card / Bank (Stripe)',
    endpoint: 'https://api.stripe.com/v1/payment_intents',
    secretKey: Deno.env.get('STRIPE_SECRET_KEY'),
    publishableKey: Deno.env.get('STRIPE_PUBLISHABLE_KEY'),
  },
};

// Generate idempotency key to prevent duplicate charges
function generateIdempotencyKey(deviceId, plan, phoneNumber) {
  return crypto
    .createHash('sha256')
    .update(`${deviceId}|${plan}|${phoneNumber}|${new Date().toISOString().split('T')[0]}`)
    .digest('hex');
}

// MTN Mobile Money collection request
async function requestMTNPayment(amount, phoneNumber, externalId, reference) {
  const provider = PROVIDERS.mtn_momo;
  const payload = {
    amount,
    currency: 'ZMW',
    externalId,
    payer: { partyIdType: 'MSISDN', partyId: phoneNumber },
    payerMessage: 'U-TECH Security Subscription',
    payeeNote: `Plan payment for device ${reference}`,
  };
  const auth = Buffer.from(`${provider.initiatorId}:${provider.apiSecret}`).toString('base64');
  try {
    const response = await fetch(`${provider.endpoint}/v1_0_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
        'X-Reference-Id': externalId,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 500 };
  }
}

// Airtel Money payment request
async function requestAirtelPayment(amount, phoneNumber, externalId, reference) {
  const provider = PROVIDERS.airtel_money;
  const payload = {
    reference: externalId,
    subscriber: { msisdn: phoneNumber },
    transaction: {
      amount,
      currency: 'ZMW',
      id: externalId,
    },
    pin: null,
  };
  try {
    const response = await fetch(`${provider.endpoint}/collect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.clientSecret}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 500 };
  }
}

// Zamtel Kwacha debit request
async function requestZamtelPayment(amount, phoneNumber, externalId, reference) {
  const provider = PROVIDERS.zamtel_kwacha;
  const timestamp = new Date().toISOString();
  const signature = crypto
    .createHash('sha256')
    .update(`${provider.merchantId}${externalId}${amount}${timestamp}${provider.apiKey}`)
    .digest('hex');
  const payload = {
    merchantId: provider.merchantId,
    transactionId: externalId,
    amount,
    currency: 'ZMW',
    msisdn: phoneNumber,
    timestamp,
    signature,
  };
  try {
    const response = await fetch(`${provider.endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 500 };
  }
}

// Stripe payment intent
async function requestStripePayment(amount, reference) {
  const provider = PROVIDERS.card_stripe;
  const payload = new URLSearchParams({
    amount: amount * 100,
    currency: 'zmw',
    description: `U-TECH Security Subscription - ${reference}`,
    metadata: { device: reference },
  });
  try {
    const response = await fetch(`${provider.endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    });
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message, status: 500 };
  }
}

// Main create-payment Edge Function
export async function createPayment(req) {
  const { deviceId, plan, phoneNumber, provider, idempotencyKey } = await req.json();

  if (!plan || !provider || (!phoneNumber && provider !== 'card_stripe')) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  // Load plan price from database (never trust client-submitted amounts)
  const { data: priceData } = await supabase
    .from('price_settings')
    .select('amount')
    .eq('key', plan)
    .single();
  const amount = priceData?.amount;
  if (!amount && plan !== 'FREE') {
    return new Response(JSON.stringify({ error: 'Plan not found' }), { status: 404 });
  }

  // Prevent duplicate payments with idempotency
  const { data: existingPayment } = await supabase
    .from('payments')
    .select('id, status')
    .eq('idempotency_key', idempotencyKey)
    .single();
  if (existingPayment) {
    return new Response(
      JSON.stringify({ paymentId: existingPayment.id, status: existingPayment.status, message: 'Payment already requested' }),
      { status: 200 }
    );
  }

  // Create payment record in pending state
  const { data: paymentRecord, error: insertError } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      device_id: deviceId,
      plan,
      amount: amount || 0,
      currency: 'ZMW',
      provider_code: provider,
      phone_number: phoneNumber,
      idempotency_key: idempotencyKey,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 });
  }

  const paymentId = paymentRecord.id;
  const externalId = `UTECH-${deviceId}-${paymentId.slice(0, 8)}`;

  // Update payment with provider reference
  await supabase.from('payments').update({ provider_reference: externalId }).eq('id', paymentId);

  // Route to appropriate provider
  let providerResult;
  if (provider === 'mtn_momo') {
    providerResult = await requestMTNPayment(amount, phoneNumber, externalId, deviceId);
  } else if (provider === 'airtel_money') {
    providerResult = await requestAirtelPayment(amount, phoneNumber, externalId, deviceId);
  } else if (provider === 'zamtel_kwacha') {
    providerResult = await requestZamtelPayment(amount, phoneNumber, externalId, deviceId);
  } else if (provider === 'card_stripe') {
    providerResult = await requestStripePayment(amount, deviceId);
  } else {
    return new Response(JSON.stringify({ error: 'Unknown provider' }), { status: 400 });
  }

  // Log provider response and update payment status
  await supabase.from('payments').update({
    status: providerResult.success ? 'processing' : 'failed',
    provider_response: providerResult.data || { error: providerResult.error },
    failure_reason: providerResult.error,
  }).eq('id', paymentId);

  if (!providerResult.success) {
    return new Response(
      JSON.stringify({ paymentId, error: providerResult.error || 'Provider request failed', status: providerResult.status }),
      { status: 402 }
    );
  }

  return new Response(
    JSON.stringify({
      paymentId,
      externalId,
      message: `Payment request sent to ${PROVIDERS[provider]?.name}. Check your phone for a prompt.`,
      provider,
    }),
    { status: 200 }
  );
}

Serve(createPayment);
