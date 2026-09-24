import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const BLUE = '#0A3D8A';
const ACTION_BLUE = '#0A84FF';

export default function HomeScreen({ onNavigate }) {
  return <SafeAreaView style={styles.safeArea}><View style={styles.container}>
    <View style={styles.content}><Text style={styles.title}>Light Smart Asset Security</Text><Text style={styles.byline}>by U-Tech Enterprise</Text><Text style={styles.description}>Verify Your Assets | Phones, Laptops, Vehicles, Pumps | Check Stolen Database | Get Safety Certificate</Text></View>
    <View style={styles.actions}>
      <Pressable style={styles.primaryButton} onPress={() => onNavigate('verify')}><Text style={styles.primaryButtonText}>VERIFY</Text></Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => onNavigate('login')}><Text style={styles.secondaryButtonText}>LOGIN</Text></Pressable>
      <Pressable onPress={() => onNavigate('register')}><Text style={styles.linkButton}>REGISTER</Text></Pressable>
    </View>
    <Pressable style={styles.adminDot} onLongPress={() => Alert.alert('Admin access', 'Use the authenticated admin dashboard; no client-side admin secret is configured.')} />
  </View></SafeAreaView>;
}
const styles = StyleSheet.create({ safeArea:{flex:1,backgroundColor:BLUE}, container:{flex:1,backgroundColor:BLUE,paddingHorizontal:24,paddingTop:50,paddingBottom:30}, content:{flex:1,justifyContent:'center',alignItems:'center'}, title:{color:'#fff',fontSize:34,fontWeight:'800',textAlign:'center',marginBottom:8}, byline:{color:'#eaf2ff',fontSize:16,fontWeight:'600',marginBottom:18}, description:{color:'#fff',fontSize:16,textAlign:'center',lineHeight:24,maxWidth:340}, actions:{gap:14,alignItems:'stretch',marginBottom:30}, primaryButton:{backgroundColor:ACTION_BLUE,borderRadius:12,paddingVertical:18,alignItems:'center'}, primaryButtonText:{color:'#fff',fontSize:18,fontWeight:'800'}, secondaryButton:{borderWidth:2,borderColor:'#fff',borderRadius:12,paddingVertical:16,alignItems:'center'}, secondaryButtonText:{color:'#fff',fontSize:17,fontWeight:'700'}, linkButton:{color:'#fff',fontSize:16,fontWeight:'700',textAlign:'center'}, adminDot:{position:'absolute',right:18,bottom:16,width:24,height:24,borderRadius:12,backgroundColor:'rgba(255,255,255,0.15)',borderWidth:1,borderColor:'rgba(255,255,255,0.4)'} });
