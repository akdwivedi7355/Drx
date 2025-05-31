import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getdefaultconsultant, getpatientList, getalldoctors, getStoredDefaultConsultant, getStoredUserDetails } from '../api/api'; // assume you have this

const iconMap = {
  Details: 'person-outline',
  Report: 'document-text-outline',
  History: 'time-outline',
  Prescriptions: 'medkit-outline',
  Vitals: 'fitness-outline',
};

export default function Dashboard() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [defaultsite, setDefaultSite] = useState(null);

  useEffect(() => {
    // Fetch default doctor and all doctors
    fetchDefaultDoctor();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchPatients(selectedDoctor.consultantCode);
    }
  }, [selectedDoctor]);

  const fetchDefaultDoctor = async () => {
    try {
      const res = await getStoredUserDetails();
      console.log('Default doctor fetched:', res);
      const defaultres = {
        consultantCode: res.userLinkedConsultantCode,
        consultantName: res.userLinkedConsultantName,
        consultantInitial: 'Dr.',
      };
      setDefaultSite(res.facilityDisplayName);
      setSelectedDoctor(defaultres);
    }
    catch (err) {
      console.error('Error fetching default doctor:', err);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await getalldoctors();
      if (res.status && res.data) {
        console.log('Doctors fetched:', res.data);
        setDoctors(res.data);
      } else {
        console.error('Doctor list fetch failed:', res.errorMessage);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchPatients = async consultantCode => {
    try {
      console.log('Fetching patients for consultant:', consultantCode);
      const res = await getpatientList(
        consultantCode,
        new Date().toISOString().split('T')[0],
        '',
        '10',
        '0'
      );
      console.log('Patients fetched:', res);
      if (res.status && res.data) {
        setPatients(res.data);
      } else {
        console.error('Patient fetch failed:', res.errorMessage);
        setPatients([]);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setPatients([]);
    }
  };

  const toggleExpand = id => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleNavigate = (patientId, tab) => {
    navigation.navigate('PatientTabs', { patientId, initialTab: tab });
  };

  const renderBottomTabStyle = patientId => (
    <View style={styles.bottomTabs}>
      {Object.keys(iconMap).map((label, i) => (
        <TouchableOpacity
          key={label}
          style={styles.tabButton}
          onPress={() => handleNavigate(patientId, i)}
        >
          <Icon name={iconMap[label]} size={20} color="#333" />
          <Text style={styles.tabText}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Doctor Name */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.doctorName}>
          {selectedDoctor ? `${selectedDoctor.consultantName}` : 'Loading...'}
        </Text>
      </TouchableOpacity>

      {/* Doctor Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {doctors.map(doc => (
              <Pressable
                key={doc.consultantCode}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedDoctor(doc);
                  setExpandedId(null);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalText}>
                  {`${doc.consultantInitial} ${doc.consultantName}`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Patient List */}
      <FlatList
        data={patients}
        keyExtractor={(item) => item.patientId.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              {expandedId !== item.patientId && (
                <Text style={styles.name}>{item.name}</Text>
              )}
              <TouchableOpacity onPress={() => toggleExpand(item.patientId)}>
                <Icon
                  name={
                    expandedId === item.patientId ? 'chevron-down' : 'chevron-forward'
                  }
                  size={22}
                />
              </TouchableOpacity>
            </View>
            {expandedId === item.patientId && (
              <View>
                <Text style={{ fontSize: 14, marginTop: 10 }}>{item.name}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>{item.abhaAddress}</Text>
                {renderBottomTabStyle(item.patientId)}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No patients found.
          </Text>
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fdfdfd' },
  doctorName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 18, fontWeight: '600' },
  bottomTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 16,
    elevation: 3,
  },
  tabButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 6,
  },
  tabText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 16,
    elevation: 5,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  modalText: { fontSize: 16 },
});
