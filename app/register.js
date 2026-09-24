import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const BLUE = '#0A3D8A';
const ACTION_BLUE = '#0A84FF';

export default function RegisterScreen({ onBack, onLogin }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Please confirm password correctly.');
      return;
    }

    Alert.alert('Registration', 'Account created successfully (demo).');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. John Mwale" />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="e.g. 076xxxxxxx" keyboardType="phone-pad" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Enter password" secureTextEntry />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm password" secureTextEntry />

        <Pressable style={styles.primaryButton} onPress={handleRegister}>
          <Text style={styles.primaryButtonText}>REGISTER</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={onLogin}>
          <Text style={styles.secondaryButtonText}>Already have an account? Login</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BLUE },
  content: { padding: 20, paddingBottom: 40 },
  backButton: { backgroundColor: '#0A84FF', borderRadius: 10, padding: 10, alignSelf: 'flex-start', marginBottom: 18 },
  backButtonText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  title: { color: BLUE, fontSize: 28, fontWeight: '800', marginBottom: 16 },
  label: { color: '#2d3b52', fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d8e4f7', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#f9fbff', marginBottom: 14 },
  primaryButton: { backgroundColor: ACTION_BLUE, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '800' },
  secondaryButton: { marginTop: 14, alignItems: 'center' },
  secondaryButtonText: { color: BLUE, fontWeight: '700' },
});
