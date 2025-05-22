import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const PatientDetail = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Patient Detail</Text>
      <Text>Name: John Doe</Text>
      <Text>Age: 34</Text>
      <Text>Gender: Male</Text>
      <Text>Blood Group: B+</Text>
    </View>
  );
};

export default PatientDetail;

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
