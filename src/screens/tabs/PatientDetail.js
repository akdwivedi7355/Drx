import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getpatientprofiledetail } from '../../api/api';

const PatientDetail = ({ patientId }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getpatientprofiledetail(patientId);
        console.log(data);
        setDetail(data.data);
      } catch (err) {
        setError('Failed to load patient details.');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchDetail();
    }
  }, [patientId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.centered}>
        <Text>No patient details available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.patientName}>{detail.patientName}</Text>
        <Text style={styles.uhid}>UHID: {detail.uhid || 'N/A'}</Text>
        <Text style={styles.uhid}>UHID Recid: {detail.uhidRecid || 'N/A'}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Date of Birth:</Text>
          <Text style={styles.value}>{detail.dob || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Gender:</Text>
          <Text style={styles.value}>{detail.gender || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Blood Group:</Text>
          <Text style={styles.value}>{detail.bloodGroup || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Mobile:</Text>
          <Text style={styles.value}>{detail.mobile || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{detail.email || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{detail.address ? detail.address.trim() : 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>ABHA Number:</Text>
          <Text style={styles.value}>{detail.abhaNumber || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>ABHA Address:</Text>
          <Text style={styles.value}>{detail.abhaAddress || 'N/A'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default PatientDetail;

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: '#f4f6f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
  },
  error: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 16,
  },
  uhid: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 4,
  },
  section: {
    marginVertical: 10,
    borderBottomColor: '#ecf0f1',
    borderBottomWidth: 1,
    // paddingBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#4a90e2',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 4,
  },
});
