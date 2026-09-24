import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import HomeScreen from './app/index';
import VerifyFlow from './app/verify';
import LoginScreen from './app/login';
import RegisterScreen from './app/register';
import PlansScreen from './app/plans';
const TABS=['home','verify','login','register'];
export default function App(){const [screen,setScreen]=useState('home');const render=()=>{switch(screen){case'verify':return <VerifyFlow onBack={()=>setScreen('home')} onPlans={()=>setScreen('plans')}/>;case'plans':return <PlansScreen onBack={()=>setScreen('home')}/>;case'login':return <LoginScreen onBack={()=>setScreen('home')} onRegister={()=>setScreen('register')} onLoggedIn={()=>setScreen('plans')}/>;case'register':return <RegisterScreen onBack={()=>setScreen('home')} onLogin={()=>setScreen('login')}/>;default:return <HomeScreen onNavigate={setScreen}/>;}};return <SafeAreaView style={styles.safe}><StatusBar style="light"/>{render()}{screen!=='plans'&&<View style={styles.tabs}>{TABS.map(tab=><Pressable key={tab} style={[styles.tab,screen===tab&&styles.active]} onPress={()=>setScreen(tab)}><Text style={styles.tabText}>{tab.toUpperCase()}</Text></Pressable>)}</View>}</SafeAreaView>}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#0A3D8A'},tabs:{flexDirection:'row',padding:8,gap:6,backgroundColor:'#0A3D8A'},tab:{flex:1,padding:10,borderRadius:8,alignItems:'center',backgroundColor:'rgba(255,255,255,.1)'},active:{backgroundColor:'#0A84FF'},tabText:{color:'#fff',fontSize:11,fontWeight:'800'}});
