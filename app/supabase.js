import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kattebbogfupsulwvql2k.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_iODMLRuQ46yBW90Uhpi9PA_ZFHjErRa';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export const SECURITY_FEATURES = [
  'Device Identity Verification (IMEI/Serial/Engine No)',
  'Stolen Database Check - No Case Found Certificate',
  'Safety Score 95%/99% + PDF Certificate by U-TECH',
  'Real-Time GPS Location Tracking',
  'Geo-Fence Alert - When asset leaves safe zone',
  'Remote Lock Asset',
  'Remote Alarm / Siren Trigger',
  'Intruder Selfie - Front Camera Auto Capture',
  'Motion & Tamper Sensor Alert',
  'SIM Change Detection Alert',
  'Offline Last-Seen Location',
  '24/7 Admin Monitoring Dashboard',
  'Police Report & Insurance Claim Letter Auto-Generate',
  'Live Camera & Mic Access',
];

export const PAYMENT_PROVIDERS = {
  dpo: 'DPO',
  mtn_momo: 'MTN Mobile Money',
  airtel_money: 'Airtel Money',
  zamtel_kwacha: 'Zamtel Kwacha',
};

export const DEFAULT_PLANS = [
  { name: 'FREE', price: 0, featureIndexes: [0, 1, 2], permissions: [], misplacedMode: false },
  { name: 'ECONOMY', price: 25, featureIndexes: [0, 1, 2, 3, 9, 10, 11], permissions: ['location'], misplacedMode: true },
  { name: 'STANDARD', price: 75, featureIndexes: [0, 1, 2, 3, 4, 5, 6, 9, 10, 11, 12], permissions: ['location', 'sensors'], misplacedMode: true },
  { name: 'ADVANCED', price: 100, featureIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13], permissions: ['camera', 'location', 'sensors'], misplacedMode: true },
  { name: 'PREMIUM', price: 150, featureIndexes: SECURITY_FEATURES.map((_, index) => index), permissions: ['camera', 'location', 'sensors', 'microphone'], misplacedMode: true },
];

export async function loadPlans() {
  const { data, error } = await supabase.from('plans').select('name, amount, features, required_permissions');
  if (error) return DEFAULT_PLANS;
  return DEFAULT_PLANS.map((fallback) => {
    const remote = data?.find((item) => item.name === fallback.name || item.name === `LEAD / ${fallback.name}`);
    if (!remote) return fallback;
    return { ...fallback, price: Number(remote.amount), permissions: remote.required_permissions || fallback.permissions };
  });
}

export async function requestPayment({ deviceId, plan, phoneNumber, provider = 'mtn_momo' }) {
  const idempotencyKey = `${deviceId || 'unknown'}-${plan.name}-${Date.now()}`;
  const { data, error } = await supabase.functions.invoke('create-payment', {
    body: {
      deviceId,
      plan: plan.name,
      phoneNumber,
      provider,
      idempotencyKey,
    },
  });

  if (error) {
    return {
      data: null,
      error: error.message || 'The payment service is currently unavailable.',
    };
  }

  return { data, error: null };
}

export async function saveSubscription({ deviceId, plan, permissionsGranted, paymentId }) {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('subscriptions').insert({
    device_id: deviceId,
    plan: plan.name,
    amount: plan.price,
    features: plan.featureIndexes.map((index) => SECURITY_FEATURES[index]),
    permissions_granted: permissionsGranted,
    payment_id: paymentId || null,
    status: 'active',
    user_id: userData?.user?.id || null,
  });
  return { error };
}

export async function sendDeviceCommand(deviceId, command) {
  return supabase.from('device_commands').insert({ device_id: deviceId, command, status: 'pending' });
}
