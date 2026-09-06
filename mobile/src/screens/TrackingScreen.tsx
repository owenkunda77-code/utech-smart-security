import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TrackingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device Tracking</Text>
      <View style={styles.mapContainer}>
        <Text style={styles.placeholder}>Map component will be displayed here</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingTop: 20,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    color: '#666',
    fontSize: 16,
  },
});

export default TrackingScreen;
