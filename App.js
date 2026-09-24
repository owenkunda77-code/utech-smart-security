import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import HomeScreen from './app/index';
import VerifyFlow from './app/verify';
import LoginScreen from './app/login';
import RegisterScreen from './app/register';
import PlansScreen from './app/plans';

const TABS = ['home', 'verify', 'login', 'register'];

export default function App() {
  const [screen, setScreen] = useState('home');

  const renderScreen = () => {
    switch (screen) {
      case 'verify':
        return <VerifyFlow onBack={() => setScreen('home')} onPlans={() => setScreen('plans')} />;
      case 'plans':
        return <PlansScreen onBack={() => setScreen('home')} />;
      case 'login':
        return <LoginScreen onBack={() => setScreen('home')} onRegister={() => setScreen('register')} />;
      case 'register':
        return <RegisterScreen onBack={() => setScreen('home')} onLogin={() => setScreen('login')} />;
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
      {screen !== 'plans' && screen !== 'admin' && (
        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const label = tab === 'home' ? 'HOME' : tab.toUpperCase();
            const active = screen === tab;
            return (
              <Pressable
                key={tab}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setScreen(tab)}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0A3D8A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 6,
  },
  tab: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#0A84FF',
  },
  tabText: {
    color: '#dfeeff',
    fontSize: 11,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#fff',
  },
});
