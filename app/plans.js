import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';

// Pass the configured Supabase client from the existing app. Do not put real
// Supabase credentials in source code; use environment/configuration instead.
const BLUE = '#0A3D8A';
const ACTION_BLUE = '#0A84FF';

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

export const PLANS = [
  { name: 'LEAD / FREE', price: 0, featureIndexes: [0, 1, 2], permissions: [] },
  { name: 'BASIC', price: 25, featureIndexes: [0, 1, 2, 3, 9, 10, 11], permissions: ['location'] },
  { name: 'STANDARD', price: 75, featureIndexes: [0, 1, 2, 3, 4, 5, 6, 9, 10, 11, 12], permissions: ['location', 'sensors'] },
  { name: 'PREMIUM', price: 150, featureIndexes: SECURITY_FEATURES.map((_, index) => index), permissions: ['camera', 'location', 'sensors', 'microphone'] },
];

async function requestPlanPermissions(plan) {
  const granted = {};

  if (plan.permissions.includes('camera')) {
    const result = await Camera.requestCameraPermissionsAsync();
    if (result.status !== 'granted') throw new Error('Denied — accept Camera access for Intruder Selfie and Live Camera.');
    granted.camera = true;
  }

  if (plan.permissions.includes('location')) {
    const result = await Location.requestForegroundPermissionsAsync();
    if (result.status !== 'granted') throw new Error('Denied — accept Location access for Real-Time Tracking.');
    granted.location = true;
  }

  if (plan.permissions.includes('sensors')) {
    // Accelerometer does not require a runtime permission on supported Expo platforms.
    // Starting and immediately removing this listener verifies sensor availability.
    const subscription = Accelerometer.addListener(() => {});
    subscription.remove();
    granted.sensors = true;
  }

  if (plan.permissions.includes('microphone')) {
    const result = await Audio.requestPermissionsAsync();
    if (result.status !== 'granted') throw new Error('Denied — accept Microphone access for Live Audio.');
    granted.microphone = true;
  }

  return granted;
}

export default function Plans({ supabase, deviceId, navigation }) {
  const [busyPlan, setBusyPlan] = useState(null);

  const subscribe = async (plan) => {
    if (!supabase || !deviceId) {
      Alert.alert('Setup required', 'Connect Supabase and provide the asset device ID before subscribing.');
      return;
    }

    setBusyPlan(plan.name);
    try {
      Alert.alert(`Subscribing ${plan.name}`, 'Checking permissions for your selected security features.');
      const permissionsGranted = await requestPlanPermissions(plan);

      const { error } = await supabase.from('subscriptions').insert({
        device_id: deviceId,
        plan: plan.name,
        amount: plan.price,
        features: plan.featureIndexes.map((index) => SECURITY_FEATURES[index]),
        permissions_granted: permissionsGranted,
        status: 'active',
      });
      if (error) throw error;

      Alert.alert('Subscription active', `${plan.name} is now active. Monitoring features can now be started.`);
      navigation?.navigate?.('Dashboard', { deviceId, plan: plan.name, permissionsGranted });
    } catch (error) {
      Alert.alert('Subscription not completed', error?.message || 'Please try again.');
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Security Plans</Text>
      <Text style={styles.subtitle}>Light Smart Asset Security · Zambia</Text>

      {PLANS.map((plan) => (
        <View key={plan.name} style={styles.card}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.price}>K{plan.price}</Text>
          <Text style={styles.permissions}>
            Permissions: {plan.permissions.length ? plan.permissions.join(', ') : 'None required'}
          </Text>

          {SECURITY_FEATURES.map((feature, index) => (
            <View key={feature} style={styles.featureRow}>
              <Text style={styles.tick}>{plan.featureIndexes.includes(index) ? '✅' : '❌'}</Text>
              <Text style={styles.feature}>{feature}</Text>
            </View>
          ))}

          <Pressable
            style={[styles.button, busyPlan !== null && styles.disabledButton]}
            onPress={() => subscribe(plan)}
            disabled={busyPlan !== null}
          >
            <Text style={styles.buttonText}>
              {busyPlan === plan.name ? 'REQUESTING ACCESS...' : `SUBSCRIBE K${plan.price}`}
            </Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BLUE },
  content: { padding: 16, paddingBottom: 40 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 18 },
  subtitle: { color: '#dce9ff', marginBottom: 18 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 18 },
  planName: { color: BLUE, fontSize: 23, fontWeight: '800' },
  price: { color: ACTION_BLUE, fontSize: 28, fontWeight: '800', marginBottom: 4 },
  permissions: { color: '#53627a', fontSize: 12, marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginVertical: 5 },
  tick: { width: 28 },
  feature: { flex: 1, color: '#172033', lineHeight: 20 },
  button: { backgroundColor: ACTION_BLUE, borderRadius: 10, padding: 15, marginTop: 16, alignItems: 'center' },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '800' },
});
