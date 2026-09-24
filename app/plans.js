import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import { DEFAULT_PLANS, SECURITY_FEATURES, createPayment, loadPlans, saveSubscription } from './supabase';

const BLUE = '#0A3D8A';
const ACTION_BLUE = '#0A84FF';
const PROVIDERS = ['MTN Mobile Money', 'Airtel Money', 'Zamtel Kwacha'];

async function requestPermissions(plan) {
  const granted = {};
  if (plan.permissions.includes('camera')) {
    const result = await Camera.requestCameraPermissionsAsync();
    if (result.status !== 'granted') throw new Error('Camera permission was not granted.');
    granted.camera = true;
  }
  if (plan.permissions.includes('location')) {
    const result = await Location.requestForegroundPermissionsAsync();
    if (result.status !== 'granted') throw new Error('Location permission was not granted.');
    granted.location = true;
  }
  if (plan.permissions.includes('sensors')) {
    const subscription = Accelerometer.addListener(() => {});
    subscription.remove();
    granted.sensors = true;
  }
  if (plan.permissions.includes('microphone')) {
    const result = await Audio.requestPermissionsAsync();
    if (result.status !== 'granted') throw new Error('Microphone permission was not granted.');
    granted.microphone = true;
  }
  return granted;
}

export default function PlansScreen({ onBack, deviceId = 'demo-device' }) {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [busy, setBusy] = useState(null);
  const [open, setOpen] = useState({});
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState(PROVIDERS[0]);

  useEffect(() => { loadPlans().then(setPlans); }, []);

  const subscribe = async (plan) => {
    setBusy(plan.name);
    try {
      const permissionsGranted = await requestPermissions(plan);
      if (plan.price === 0) {
        const result = await saveSubscription({ deviceId, plan, permissionsGranted });
        if (result.error) throw result.error;
        Alert.alert('Subscription active', `${plan.name} is now active.`);
        return;
      }
      if (!phoneNumber.trim()) throw new Error('Enter the mobile-money number to charge.');
      const payment = await createPayment({ deviceId, plan, phoneNumber: phoneNumber.trim(), provider });
      if (payment.error) throw payment.error;
      Alert.alert('Payment requested', payment.data?.message || 'Approve the payment request on your phone. Your plan will activate after provider confirmation.');
    } catch (error) {
      Alert.alert('Payment not completed', error?.message || 'Please try again.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Security Plans</Text>
      <Text style={styles.subtitle}>Real payment requests use Supabase Edge Functions. No payment is simulated.</Text>
      <Pressable style={styles.back} onPress={onBack}><Text style={styles.buttonText}>Back</Text></Pressable>
      <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Mobile-money number e.g. 097xxxxxxx" keyboardType="phone-pad" />
      <Text style={styles.label}>Payment provider</Text>
      <View style={styles.providerRow}>{PROVIDERS.map((item) => <Pressable key={item} style={[styles.provider, provider === item && styles.selected]} onPress={() => setProvider(item)}><Text>{item}</Text></Pressable>)}</View>
      {plans.map((plan) => {
        const expanded = !!open[plan.name];
        return <View key={plan.name} style={styles.card}>
          <Text style={styles.planName}>{plan.name}</Text><Text style={styles.price}>K{plan.price}</Text>
          <Pressable style={styles.tab} onPress={() => setOpen((previous) => ({ ...previous, [plan.name]: !expanded }))}><Text style={styles.tabText}>VIEW FEATURES {expanded ? '▲' : '▼'}</Text></Pressable>
          {expanded && plan.featureIndexes.map((index) => <Text key={index} style={styles.feature}>✅ {SECURITY_FEATURES[index]}</Text>)}
          <Pressable style={[styles.button, busy && styles.disabled]} onPress={() => subscribe(plan)} disabled={!!busy}><Text style={styles.buttonText}>{busy === plan.name ? 'PROCESSING...' : plan.price ? `PAY K${plan.price}` : 'ACTIVATE FREE PLAN'}</Text></Pressable>
        </View>;
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BLUE }, content: { padding: 16, paddingBottom: 40 }, title: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 18 }, subtitle: { color: '#dce9ff', marginBottom: 18 }, back: { backgroundColor: ACTION_BLUE, borderRadius: 10, padding: 10, alignSelf: 'flex-start', marginBottom: 14 }, input: { backgroundColor: '#fff', borderRadius: 10, padding: 13, marginBottom: 10 }, label: { color: '#fff', fontWeight: '700', marginBottom: 6 }, providerRow: { gap: 6, marginBottom: 16 }, provider: { backgroundColor: '#fff', padding: 10, borderRadius: 8 }, selected: { backgroundColor: '#9dccff' }, card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 18 }, planName: { color: BLUE, fontSize: 23, fontWeight: '800' }, price: { color: ACTION_BLUE, fontSize: 28, fontWeight: '800' }, tab: { backgroundColor: '#e9f2ff', borderRadius: 8, padding: 12, marginVertical: 10 }, tabText: { color: BLUE, fontWeight: '800' }, feature: { color: '#172033', lineHeight: 20, marginVertical: 3 }, button: { backgroundColor: ACTION_BLUE, borderRadius: 10, padding: 15, marginTop: 16, alignItems: 'center' }, disabled: { opacity: 0.6 }, buttonText: { color: '#fff', fontWeight: '800' },
});
