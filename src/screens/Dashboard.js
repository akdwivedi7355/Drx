/* eslint-disable react-native/no-inline-styles */
/* eslint-disable comma-dangle */
/* eslint-disable curly */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import {
  getpatientList,
  getdefaultconsultant,
  getUserDefaultDetails,
} from '../api/api';
import { TextInput } from 'react-native-paper';
import DateTimePicker from 'react-native-date-picker';
import Feather from 'react-native-vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const iconMap = {
  Prescriptions: { icon: 'clipboard-outline', name: 'Prescription', color: '#4F46E5' },
  Diagnostic: { icon: 'flask-outline', name: 'Diagnostic', color: '#059669' },
  MedicalBill: { icon: 'cash-outline', name: 'Medical Bill', color: '#B45309' },
  Discard: { icon: 'trash-outline', name: 'Discard', color: '#DC2626' },
};

export default function Dashboard() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigation = useNavigation();

  // Add sortedPatients computed value
  const sortedPatients = React.useMemo(() => {
    return [...patients].sort((a, b) => {
      const tokenA = parseInt(a.tokenNo, 10);
      const tokenB = parseInt(b.tokenNo, 10);
      return tokenA - tokenB;
    });
  }, [patients]);

  useFocusEffect(
    React.useCallback(() => {
      fetchDefaultDoctor();
      console.log('hjjkdhjehdh');
      fetchPatients(0, false); // Re-fetch when screen regains focus
    }, [])
  );

  const fetchDefaultDoctor = async () => {
    try {
      const res = await getUserDefaultDetails();
      const defaultres = {
        consultantCode: res.data.userLinkedConsultantCode,
        consultantName: res.data.userLinkedConsultantName,
        consultantInitial: 'Dr.',
      };
      setSelectedDoctor(defaultres);
    } catch (err) {
      console.error('Error fetching default doctor:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await getdefaultconsultant();
      if (res.status && res.data) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const formatDate = (inputDate) => {
    const dateObj = new Date(inputDate);
    return `${String(dateObj.getDate()).padStart(2, '0')}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${dateObj.getFullYear()}`;
  };

  const fetchPatients = async (pageIndex = 0, append = false) => {
    console.log('Fetching patients for doctor:', selectedDoctor, 'Date:', selectedDate, 'Search:', searchText, 'Page:', pageIndex);
    let defaultres = {};
    if (selectedDoctor === null || selectedDoctor.consultantCode === '') {
      const res = await getUserDefaultDetails();
      defaultres = {
        consultantCode: res.data.userLinkedConsultantCode,
        consultantName: res.data.userLinkedConsultantName,
        consultantInitial: 'Dr.',
      };
    };
    try {
      setLoading(true);
      const res = await getpatientList(
        selectedDoctor.consultantCode || defaultres.consultantCode,
        formatDate(selectedDate),
        searchText,
        '10',
        (pageIndex * 10).toString()
      );

      if (res.status && res.data) {
        if (res.data.length < 10) setHasMoreData(false);
        console.log('Fetched patients:', res.data);
        setPatients(prev => append ? [...prev, ...res.data] : res.data);
      } else {
        setHasMoreData(false);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultDoctor();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      setPage(0);
      setHasMoreData(true);
      fetchPatients(0, false);
    }
  }, [selectedDoctor, selectedDate, searchText]);

  const handleLoadMore = () => {
    if (!loading && hasMoreData) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPatients(nextPage, true);
    }
  };

  const toggleExpand = id => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleNavigate = (patientId, tab) => {
    const patient = patients.find(p => p.regId === patientId);

    console.log('Navigating for patient:', patient, 'Tab:', tab);

    if (!patient) {
      console.warn('Patient not found!');
      return;
    }

    switch (tab) {
      case 0:
        navigation.navigate('PrescriptionSubmission', { patient });
        break;
      case 1:
        navigation.navigate('DiagnosticSubmission', { patient });
        break;
      case 2:
        navigation.navigate('MedicalBillSubmission', { patient });
        break;
      case 3:
        navigation.navigate('MedicalBillSubmission', { patient });
        break;
      case 6:
        navigation.navigate('PatientTabs', { patientId, initialTab: 0 });
        break;
      default:
        console.warn('Unhandled tab value:', tab);
    }
  };

  const renderPatientItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleNavigate(item.regId, 6)}
      style={styles.cardContainer}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.leftSection}>
            <View style={styles.tokenContainer}>
              <Text style={styles.tokenText}>{item.tokenNo}</Text>
            </View>
            <View style={styles.mainInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>{item.patientName}</Text>
               
              </View>
              
              <View style={styles.metaItem}>
              <View style={styles.detailsRow}>
                <Text style={styles.uhid}>UHID: {item.uhidNo}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.regTime}>{item.regDate} {item.regTime}</Text>
              </View>
              <View style={styles.detailsRow}>
              <Text style={styles.gender}>{item.gender}</Text>
              <Text style={styles.age}>{item.age}</Text>
              </View>
              
              </View>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => toggleExpand(item.regId)}
          >
            <Icon
              name={expandedId === item.regId ? "chevron-up-circle" : "chevron-down-circle"}
              size={20}
              color="#4F46E5"
            />
          </TouchableOpacity>
        </View>
        
        {expandedId === item.regId && (
          <View style={styles.bottomTabs}>
            {Object.keys(iconMap).map((label, i) => (
              <TouchableOpacity
                key={label}
                style={styles.tabButton}
                onPress={() => handleNavigate(item.regId, i)}
              >
                <Icon name={iconMap[label].icon} size={18} color={iconMap[label].color} />
                <Text style={[styles.tabText, { color: iconMap[label].color }]}>
                  {iconMap[label].name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#F9FAFB" barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.doctorSelector} 
          onPress={() => setModalVisible(true)}
        >
          <Icon name="medkit" size={24} color="#4F46E5" />
          <Text style={styles.doctorName}>
            {selectedDoctor ? `${selectedDoctor.consultantInitial} ${selectedDoctor.consultantName}` : 'Loading...'}
          </Text>
          <Icon name="chevron-down" size={20} color="#4F46E5" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
        >
          <Feather name="calendar" size={20} color="#4F46E5" />
          <Text style={styles.dateText}>{selectedDate}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#6B7280" />
          <TextInput
            mode="flat"
            placeholder="Search patients..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
            theme={{ colors: { primary: '#4F46E5' } }}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Patient Registration')}
          style={styles.addButton}
        >
          <Icon name="person-add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedPatients}
        keyExtractor={(item) => item.regId.toString()}
        renderItem={renderPatientItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>No patients found</Text>
          </View>
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator color="#4F46E5" style={{ marginVertical: 16 }} />
          ) : !hasMoreData && patients.length > 0 ? (
            <Text style={styles.footerText}>No more records</Text>
          ) : null
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Doctor</Text>
            {doctors.map(doc => (
              <Pressable
                key={doc.consultantCode}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedDoctor(doc);
                  setModalVisible(false);
                  setExpandedId(null);
                }}
              >
                <Icon name="person" size={24} color="#4F46E5" />
                <Text style={styles.modalText}>
                  {`${doc.consultantInitial} ${doc.consultantName}`}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <DateTimePicker
        modal
        open={showDatePicker}
        date={new Date(selectedDate)}
        mode="date"
        onConfirm={(date) => {
          setSelectedDate(date.toISOString().split('T')[0]);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  doctorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  doctorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 6,
    marginRight: 4,
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dateText: {
    marginLeft: 6,
    color: '#4F46E5',
    fontWeight: '500',
    fontSize: 13,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 36,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 36,
    marginLeft: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 13,
  },
  listContainer: {
    padding: 8,
  },
  cardContainer: {
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  tokenText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
  },
  mainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  gender: {
    fontSize: 11,
    color: '#6B7280',
    marginHorizontal: 4,
  },
  age: {
    fontSize: 11,
    color: '#6B7280',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uhid: {
    fontSize: 11,
    color: '#6B7280',
  },
  dot: {
    fontSize: 11,
    color: '#6B7280',
    marginHorizontal: 4,
  },
  regTime: {
    fontSize: 11,
    color: '#6B7280',
  },
  expandButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  bottomTabs: {
    flexDirection: 'row',
    padding: 6,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: 4,
    margin: 2,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalText: {
    fontSize: 14,
    color: '#111827',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  footerText: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 12,
    fontSize: 13,
  },
});
