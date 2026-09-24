import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import HomeScreen from './app/index';
import VerifyFlow from './app/verify';
import PlansScreen from './app/plans';

export default function App() {
  const [screen, setScreen] = useState('home');

  const renderScreen = () => {
    switch (screen) {
      case 'verify':
        return <VerifyFlow onBack={() => setScreen('home')} onPlans={() => setScreen('plans')} />;
      case 'plans':
        return <PlansScreen onBack={() => setScreen('home')} />;
      case 'login':
        return <PlaceholderScreen title="Login" onBack={() => setScreen('home')} />;
      case 'register':
        return <PlaceholderScreen title="Register" onBack={() => setScreen('home')} />;
      case 'admin':
        return <PlaceholderScreen title="Admin" onBack={() => setScreen('home')} />;
      default:
        return <HomeScreen onNavigate={setScreen} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {renderScreen()}
    </SafeAreaView>
  );
}

function PlaceholderScreen({ title, onBack }) {
  return (
    <View style={styles.placeholderView}>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A3D8A' },
  placeholderView: {
    flex: 1,
    backgroundColor: '#0A3D8A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#0A84FF',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
