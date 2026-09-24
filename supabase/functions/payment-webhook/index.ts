import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Webhook signature verification for each provider
function verifyMTNSignature(payload, signature, secret) {
  const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  return hash === signature;
}

function verifyAirtelSignature(payload, signature, secret) {
  const hash = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  return hash === signature;
}

function verifyZamtelSignature(payload, signature, merchantId, apiKey) {
  const hashInput = `${merchantId}${payload.transactionId}${payload.amount}${payload.status}${apiKey}`;
  const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
  return hash === signature;
}

function verifyStripeSignature(payload, signature, secret) {
  const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return hash === signature;
}

// Process MTN webhook
async function handleMTNWebhook(body, signature) {
  const secret = Deno.env.get('MTN_WEBHOOK_SECRET');
  if (!verifyMTNSignature(body, signature, secret)) {
    return { error: 'Invalid signature', status: 401 };
  }

  const paymentStatus = body.status === 'SUCCESSFUL' ? 'confirmed' : body.status === 'FAILED' ? 'failed' : 'processing';
  const { data: payment } = await supabase
    .from('payments')
    .select('id')
    .eq('provider_reference', body.externalId)
    .single();

  if (!payment) return { error: 'Payment not found', status: 404 };

  await supabase.from('payments').update({ status: paymentStatus, provider_response: body, paid_at: new Date() }).eq('id', payment.id);

  if (paymentStatus === 'confirmed') {
    const { data: paymentRecord } = await supabase.from('payments').select('*').eq('id', payment.id).single();
    await supabase.from('subscriptions').insert({
      device_id: paymentRecord.device_id,
      plan: paymentRecord.plan,
      amount: paymentRecord.amount,
      payment_id: payment.id,
      user_id: paymentRecord.user_id,
      status: 'active',
    });
  }
  return { success: true, paymentId: payment.id };
}

// Process Airtel webhook
async function handleAirtelWebhook(body, signature) {
  const secret = Deno.env.get('AIRTEL_WEBHOOK_SECRET');
  if (!verifyAirtelSignature(body, signature, secret)) {
    return { error: 'Invalid signature', status: 401 };
  }
  // Similar logic to MTN
  return { success: true };
}

// Process Zamtel webhook
async function handleZamtelWebhook(body, signature) {
  const merchantId = Deno.env.get('ZAMTEL_MERCHANT_ID');
  const apiKey = Deno.env.get('ZAMTEL_API_KEY');
  if (!verifyZamtelSignature(body, signature, merchantId, apiKey)) {
    return { error: 'Invalid signature', status: 401 };
  }
  // Similar logic
  return { success: true };
}

// Process Stripe webhook
async function handleStripeWebhook(payload, signature) {
  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  try {
    const event = JSON.parse(payload);
    if (!verifyStripeSignature(payload, signature, secret)) {
      return { error: 'Invalid signature', status: 401 };
    }
    if (event.type === 'payment_intent.succeeded') {
      const externalId = event.data.object.metadata.device;
      const { data: payment } = await supabase
        .from('payments')
        .select('id')
        .eq('provider_reference', externalId)
        .single();
      if (payment) {
        await supabase.from('payments').update({ status: 'confirmed', paid_at: new Date() }).eq('id', payment.id);
      }
    }
    return { success: true };
  } catch (error) {
    return { error: error.message, status: 500 };
  }
}

// Main webhook router
export async function handleWebhook(req) {
  const provider = new URL(req.url).pathname.split('/').pop();
  const signature = req.headers.get('x-signature') || req.headers.get('stripe-signature');
  const body = await req.text();

  let result;
  if (provider === 'mtn') {
    result = await handleMTNWebhook(JSON.parse(body), signature);
  } else if (provider === 'airtel') {
    result = await handleAirtelWebhook(JSON.parse(body), signature);
  } else if (provider === 'zamtel') {
    result = await handleZamtelWebhook(JSON.parse(body), signature);
  } else if (provider === 'stripe') {
    result = await handleStripeWebhook(body, signature);
  } else {
    return new Response(JSON.stringify({ error: 'Unknown provider' }), { status: 400 });
  }

  // Log webhook
  await supabase.from('webhook_logs').insert({
    provider_code: provider,
    payload: body,
    signature_valid: !result.error,
    error_message: result.error,
  });

  return new Response(JSON.stringify(result), { status: result.status || (result.error ? 400 : 200) });
}

Serve(handleWebhook);
