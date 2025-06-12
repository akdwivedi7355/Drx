import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getpatientprofiledetail, PatientHistoryData } from '../../api/api';

const PatientHistory = ({ patientId }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getpatientprofiledetail(patientId);
        console.log("response", response);

        const res = await PatientHistoryData({ uhid: response.data.uhid, hiType: 2 });
        console.log("res", res);
        setHistory(res.data);
      } catch (err) {
        setError('Failed to load patient history.');
        console.error('Error fetching patient history:', err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientHistory();
    }
  }, [patientId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0A3C97" />
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

  if (!history) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noData}>No patient history available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Icon name="history" size={24} color="#0A3C97" />
        <Text style={styles.header}>Patient History</Text>
      </View>

      {/* Visit History Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="event" size={20} color="#0A3C97" />
          <Text style={styles.sectionTitle}>Recent Visits</Text>
        </View>
        <View style={styles.divider} />
        {/* Replace with actual visit data mapping when available */}
        <View style={styles.visitItem}>
          <Text style={styles.visitDate}>Last Visit: {history.lastVisitDate || 'N/A'}</Text>
          <Text style={styles.visitDetails}>Doctor: {history.lastVisitDoctor || 'N/A'}</Text>
        </View>
      </View>

      {/* Medical History Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Icon name="medical-services" size={20} color="#0A3C97" />
          <Text style={styles.sectionTitle}>Medical History</Text>
        </View>
        <View style={styles.divider} />
        {/* Replace with actual medical history data mapping when available */}
        <View style={styles.historyItem}>
          <Text style={styles.historyLabel}>Past Illnesses:</Text>
          <Text style={styles.historyValue}>{history.pastIllnesses || 'No past illnesses recorded'}</Text>
        </View>
        <View style={styles.historyItem}>
          <Text style={styles.historyLabel}>Allergies:</Text>
          <Text style={styles.historyValue}>{history.allergies || 'No allergies recorded'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(10, 60, 151, 0.1)',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#0A3C97',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    margin: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A3C97',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(10, 60, 151, 0.1)',
    marginBottom: 14,
  },
  visitItem: {
    marginBottom: 10,
  },
  visitDate: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  visitDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  historyItem: {
    marginBottom: 12,
  },
  historyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  historyValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  error: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
  },
  noData: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PatientHistory;
