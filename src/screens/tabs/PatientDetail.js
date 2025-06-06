import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
        <Text style={styles.uhid}>UHID: <Text style={styles.uhidValue}>{detail.uhidRecid || 'N/A'}</Text></Text>

        <View style={styles.infoRow}>
          <Icon name="calendar-today" size={20} color="#555" />
          <Text style={styles.infoText}>Age: {detail.dob || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="wc" size={20} color="#555" />
          <Text style={styles.infoText}>Gender: {detail.gender || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="invert-colors" size={20} color="#555" />
          <Text style={styles.infoText}>Blood Group: {detail.bloodGroup || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="phone" size={20} color="#555" />
          <Text style={styles.infoText}>Mobile: {detail.mobile || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="email" size={20} color="#555" />
          <Text style={styles.infoText}>Email: {detail.email || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="home" size={20} color="#555" />
          <Text style={styles.infoText}>Address: {detail.address ? detail.address.trim() : 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="badge" size={20} color="#555" />
          <Text style={styles.infoText}>ABHA Number: {detail.abhaNumber || 'N/A'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon name="alternate-email" size={20} color="#555" />
          <Text style={styles.infoText}>ABHA Address: {detail.abhaAddress || 'N/A'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default PatientDetail;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ecf0f3',
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f3',
  },
  error: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginBottom: 20,
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
    textAlign: 'center',
  },
  uhid: {
    fontSize: 16,
    color: '#34495e',
    textAlign: 'center',
    marginBottom: 12,
  },
  uhidValue: {
    fontWeight: 'bold',
    color: '#2980b9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#34495e',
  },
});
