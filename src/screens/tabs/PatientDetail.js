import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getpatientprofiledetail } from '../../api/api';

const { height } = Dimensions.get('window');

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

  if (!detail) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noData}>No patient details available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* Compact Header */}
      <View style={styles.headerCompact}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Icon name="account-circle" size={40} color="#0A3C97" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.patientName}>{detail.patientName}</Text>
            <Text style={styles.uhidValue}>UHID: {detail.uhidRecid || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Basic Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="person" size={20} color="#0A3C97" />
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Icon name="calendar-today" size={20} color="#0A3C97" />
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoValue}>{detail.dob || 'N/A'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="wc" size={20} color="#0A3C97" />
                <Text style={styles.infoLabel}>Gender</Text>
                <Text style={styles.infoValue}>{detail.gender || 'N/A'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="invert-colors" size={20} color="#0A3C97" />
                <Text style={styles.infoLabel}>Blood Group</Text>
                <Text style={styles.infoValue}>{detail.bloodGroup || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* ABHA Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="verified-user" size={20} color="#0A3C97" />
              <Text style={styles.sectionTitle}>ABHA Details</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Icon name="badge" size={20} color="#0A3C97" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ABHA Number</Text>
                <Text style={styles.infoValue}>{detail.abhaNumber || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="alternate-email" size={20} color="#0A3C97" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ABHA Address</Text>
                <Text style={styles.infoValue}>{detail.abhaAddress || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Contact Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="contacts" size={20} color="#0A3C97" />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Icon name="phone" size={20} color="#0A3C97" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Mobile</Text>
                <Text style={styles.infoValue}>{detail.mobile || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="email" size={20} color="#0A3C97" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{detail.email || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="home" size={20} color="#0A3C97" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {detail.address ? detail.address.trim() : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  headerCompact: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(10, 60, 151, 0.1)',
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: 14,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
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
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: 'rgba(10, 60, 151, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0A3C97',
    marginBottom: 2,
  },
  uhidValue: {
    fontSize: 13,
    color: '#6B7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    width: '31%',
    backgroundColor: 'rgba(10, 60, 151, 0.05)',
    padding: 10,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
});

export default PatientDetail;
