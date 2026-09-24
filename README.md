import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const BLUE = '#0A3D8A';
const ACTION_BLUE = '#0A84FF';

const paymentOptions = ['MTN Mobile Money', 'Airtel Money', 'Zamtel Kwacha', 'Card / Bank'];

export default function VerifyFlow({ onBack, onPlans }) {
  const [step, setStep] = useState(1);
  const [deviceId, setDeviceId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('MTN Mobile Money');
  const [mobileNumber, setMobileNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [status, setStatus] = useState('');
  const [result, setResult] = useState('');

  const buttonText = useMemo(() => {
    if (step === 1) return 'CONTINUE';
    if (step === 2) return 'NEXT';
    if (step === 3) return 'PAY NOW - K25';
    return 'VIEW PLANS';
  }, [step]);

  const handleContinue = () => {
    if (step === 1 && !deviceId.trim()) {
      Alert.alert('Missing device identity', 'Please enter the IMEI, serial, engine number or asset tag.');
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      const isCard = paymentMethod === 'Card / Bank';
      if (isCard) {
        if (!cardNumber || !expiry || !cvv) {
          Alert.alert('Missing payment details', 'Enter card number, expiry and CVV.');
          return;
        }
      } else if (!mobileNumber.trim()) {
        Alert.alert('Missing payment number', 'Enter the number to pay from.');
        return;
      }

      setStatus('Initiating payment... Check your phone for PIN prompt');
      setTimeout(() => {
        const success = Math.random() > 0.2;
        if (success) {
          setStatus('Payment successful');
          setStep(4);
          setResult('SAFE / NOT REPORTED STOLEN');
        } else {
          setStatus('Payment Failed');
          Alert.alert('Payment Failed', 'Your payment could not be confirmed. Please try again.');
        }
      }, 1500);
      return;
    }
    onPlans?.();
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <View style={styles.card}>
          <Text style={styles.title}>Verify Asset</Text>
          <Text style={styles.label}>Enter Device Identity Code (IMEI / Serial / Engine No / Asset Tag)</Text>
          <TextInput
            style={styles.input}
            value={deviceId}
            onChangeText={setDeviceId}
            placeholder="e.g. IMEI or serial"
          />
        </View>
      );
    }

    if (step === 2) {
      return (
        <View style={styles.card}>
          <Text style={styles.title}>Choose Payment Method for Verification Fee</Text>
          {paymentOptions.map((method) => (
            <Pressable
              key={method}
              style={[styles.optionButton, paymentMethod === method && styles.optionSelected]}
              onPress={() => setPaymentMethod(method)}
            >
              <Text style={[styles.optionText, paymentMethod === method && styles.optionTextSelected]}>{method}</Text>
            </Pressable>
          ))}
        </View>
      );
    }

    if (step === 3) {
      const isCard = paymentMethod === 'Card / Bank';
      return (
        <View style={styles.card}>
          <Text style={styles.title}>Enter Number to Pay From</Text>
          {isCard ? (
            <>
              <TextInput style={styles.input} value={cardNumber} onChangeText={setCardNumber} placeholder="Card Number" keyboardType="number-pad" />
              <TextInput style={styles.input} value={expiry} onChangeText={setExpiry} placeholder="Expiry (MM/YY)" />
              <TextInput style={styles.input} value={cvv} onChangeText={setCvv} placeholder="CVV" keyboardType="number-pad" secureTextEntry />
            </>
          ) : (
            <TextInput
              style={styles.input}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Mobile Number for payment e.g 076xxxxxxx"
              keyboardType="phone-pad"
            />
          )}
          <Text style={styles.amount}>Payment: K25</Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <Text style={styles.title}>Searching Database...</Text>
        <Text style={styles.result}>{result || 'SAFE / NOT REPORTED STOLEN'}</Text>
        <Text style={styles.status}>{status || 'Verification complete'}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      {renderStep()}
      {status && step === 3 && <Text style={styles.status}>{status}</Text>}
      <Pressable style={styles.primaryButton} onPress={handleContinue}>
        <Text style={styles.primaryButtonText}>{buttonText}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BLUE,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 10,
    padding: 10,
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
  },
  title: {
    color: BLUE,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
  },
  label: {
    color: '#2d3b52',
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8e4f7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#f9fbff',
    marginBottom: 8,
  },
  optionButton: {
    backgroundColor: '#f4f9ff',
    borderWidth: 1,
    borderColor: '#d8e4f7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  optionSelected: {
    borderColor: ACTION_BLUE,
    backgroundColor: '#edf5ff',
  },
  optionText: {
    color: BLUE,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: ACTION_BLUE,
  },
  amount: {
    color: BLUE,
    fontWeight: '800',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: ACTION_BLUE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  status: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  result: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
});
