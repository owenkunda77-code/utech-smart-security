import React, { useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const BLUE = '#0A3D8A';
const ACTION_BLUE = '#0A84FF';

export default function HomeScreen({ onNavigate }) {
  const longPressRef = useRef(null);
  const [isAdminPressed, setIsAdminPressed] = useState(false);

  const startAdminTimer = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
    longPressRef.current = setTimeout(() => {
      Alert.prompt(
        'Admin access',
        'Enter the admin key',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open', onPress: (value) => {
              if (value === 'UTECH_ADMIN_2025') {
                onNavigate('admin');
              } else {
                Alert.alert('Invalid key');
              }
            } },
        ],
        'secure-text'
      );
    }, 3000);
  };

  const cancelAdminTimer = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Light Smart Asset Security</Text>
          <Text style={styles.byline}>by U-Tech Enterprise</Text>
          <Text style={styles.description}>
            Verify Your Assets | Phones, Laptops, Vehicles, Pumps | Check Stolen Database | Get Safety Certificate
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={() => onNavigate('verify')}>
            <Text style={styles.primaryButtonText}>VERIFY</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => onNavigate('login')}>
            <Text style={styles.secondaryButtonText}>LOGIN</Text>
          </Pressable>

          <Pressable onPress={() => onNavigate('register')}>
            <Text style={styles.linkButton}>REGISTER</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.adminDot}
          onLongPress={startAdminTimer}
          onPressOut={cancelAdminTimer}
          onPress={() => setIsAdminPressed(true)}
        >
          <Text style={styles.adminDotText}> </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BLUE,
  },
  container: {
    flex: 1,
    backgroundColor: BLUE,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  byline: {
    color: '#eaf2ff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 18,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 22,
    maxWidth: 340,
  },
  actions: {
    gap: 14,
    alignItems: 'stretch',
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: ACTION_BLUE,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    minHeight: 58,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 54,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  linkButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
  adminDot: {
    position: 'absolute',
    right: 18,
    bottom: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  adminDotText: {
    opacity: 0,
  },
});
