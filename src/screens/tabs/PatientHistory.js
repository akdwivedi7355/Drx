import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PatientHistory = ({ patientId }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Patient History{patientId}</Text>
      <Text>Last Visit: 2024-12-15</Text>
      <Text>Past Illnesses: Asthma, Migraine</Text>
    </View>
  );
};

export default PatientHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
