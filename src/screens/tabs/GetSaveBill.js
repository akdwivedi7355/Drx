import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { getpatientprofiledetail, PatientHistoryData, GetSaleBill, DiscardRecord } from '../../api/api';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Pdf from 'react-native-pdf';

const GetSaveBill = ({ patientId }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [showData, setShowData] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [memberDetails, setMemberDetails] = useState(null);

  useEffect(() => {
    const fetchPatientHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getpatientprofiledetail(patientId);
        setMemberDetails(response.data);
        const res = await PatientHistoryData({ uhid: response.data.uhid, hiType: 0});
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

  const handleCardPress = async (docId) => {
    try {
      setPdfLoading(true);
      setShowData(false);
      setModalVisible(true);
      
      const res = await GetSaleBill({ docid: docId });
      if (res.data) {
        const source = {
          uri: `data:application/pdf;base64,${res.data}`,
        };
        setSelectedPdf(source);
      }
    } catch (err) {
      console.error('Error loading bill:', err);
      setError('Failed to load bill.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDiscardRecord = async (uhid, regDocid, docid, hiType) => {
    Alert.alert(
      'Discard Record',
      'Are you sure you want to discard this record?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await DiscardRecord(uhid, regDocid, docid, hiType);
              if (res.status) {
                Alert.alert('Success', 'Record discarded successfully');
                // Refresh the history data
                const response = await getpatientprofiledetail(patientId);
                setMemberDetails(response.data);
                const historyRes = await PatientHistoryData({ uhid: response.data.uhid, hiType: 0});
                setHistory(historyRes.data);
              } else {
                Alert.alert('Error', 'Failed to discard record');
              }
            } catch (error) {
              console.error('Error discarding record:', error);
              Alert.alert('Error', 'Failed to discard record');
            }
          }
        }
      ]
    );
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedPdf(null);
    setShowData(true);
  };

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

  if (!history || !history.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noData}>No bills available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showData && (
        <ScrollView>
          {memberDetails && (
            <View style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <Icon name="person" size={24} color="#fff" />
                <Text style={styles.memberName}>{memberDetails.patientName || 'Patient'}</Text>
              </View>
              <View style={styles.memberDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>UHID</Text>
                    <Text style={styles.detailValue}>{memberDetails.uhidRecid || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>ABHA Address</Text>
                    <Text style={styles.detailValue}>{memberDetails.abhaAddress || 'N/A'}</Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Gender</Text>
                    <Text style={styles.detailValue}>{memberDetails.gender || 'N/A'}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Mobile</Text>
                    <Text style={styles.detailValue}>{memberDetails.mobile || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.headerSection}>
            <Icon name="receipt" size={24} color="#0A3C97" />
            <Text style={styles.header}>Bills</Text>
          </View>

          {history.map((item) => (
            <TouchableOpacity
              key={item.docId}
              style={styles.card}
              onPress={() => handleCardPress(item.docId)}
            >
              <View style={styles.cardContent}>
                <View style={styles.dateSection}>
                  <Text style={styles.dateText}>{item.docDate?.split(' ')[0]}</Text>
                  <Text style={styles.timeText}>{item.docTime}</Text>
                </View>
                <View style={styles.visitDetails}>
                  <View style={styles.doctorSection}>
                    <Icon name="medical-services" size={20} color="#0A3C97" />
                    <Text style={styles.doctorName}>{item.drInitial} {item.consultantName}</Text>
                  </View>
                  <View style={styles.regSection}>
                    <Text style={styles.regNo}>Reg No: {item.regNo}</Text>
                    <Text style={styles.docNo}>Doc No: {item.docNo}</Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <View style={styles.viewPrescription}>
                    <Icon name="description" size={20} color="#0A3C97" />
                    <Text style={styles.viewText}>View Bill</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.discardButton}
                    onPress={() => handleDiscardRecord(memberDetails.uhid, item.regNo, item.docNo, 0)}
                  >
                    <Icon name="delete" size={20} color="#FF3B30" />
                    <Text style={styles.discardText}>Discard</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: '#fff' }]}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={handleCloseModal}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            
            {pdfLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0A3C97" />
                <Text style={styles.loadingText}>Loading bill...</Text>
              </View>
            ) : selectedPdf ? (
              <View style={[styles.pdfContainer, { flex: 1 }]}>
                <Pdf
                  source={selectedPdf}
                  style={styles.pdf}
                  enablePaging={true}
                  onLoadComplete={(numberOfPages, filePath) => {
                    console.log(`Number of pages: ${numberOfPages}`);
                  }}
                  onPageChanged={(page, numberOfPages) => {
                    console.log(`Current page: ${page}`);
                  }}
                  onError={(error) => {
                    console.log(error);
                    setError('Failed to load PDF.');
                    setPdfLoading(false);
                  }}
                />
              </View>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>Failed to load bill.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
  memberCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  memberHeader: {
    backgroundColor: '#0A3C97',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  memberDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    marginHorizontal: 8,
  },
  detailLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#0A3C97',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 16,
  },
  dateSection: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A3C97',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  visitDetails: {
    borderLeftWidth: 2,
    borderLeftColor: '#0A3C97',
    paddingLeft: 12,
    marginBottom: 12,
  },
  doctorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
  },
  regSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  regNo: {
    fontSize: 13,
    color: '#6B7280',
  },
  docNo: {
    fontSize: 13,
    color: '#6B7280',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewPrescription: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
  },
  discardText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0A3C97',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  noData: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default GetSaveBill; 