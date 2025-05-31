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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getpatientList, getalldoctors, getStoredUserDetails } from '../api/api';
import { TextInput } from 'react-native-paper';
import DateTimePicker from 'react-native-date-picker';

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
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);


  useEffect(() => {
    // Fetch default doctor and all doctors
    fetchDefaultDoctor();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      fetchPatients(selectedDoctor.consultantCode, selectedDate, searchText);
    }
  }, [selectedDoctor, selectedDate, searchText]);


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

  // const fetchPatients = async consultantCode => {
  //   try {
  //     console.log('Fetching patients for consultant:', consultantCode);
  //     const res = await getpatientList(
  //       consultantCode,
  //       new Date().toISOString().split('T')[0],
  //       '',
  //       '10',
  //       '0'
  //     );
  //     console.log('Patients fetched:', res);
  //     if (res.status && res.data) {
  //       setPatients(res.data);
  //     } else {
  //       console.error('Patient fetch failed:', res.errorMessage);
  //       setPatients([]);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching patients:', err);
  //     setPatients([]);
  //   }
  // };

  const formatDate = (inputDate) => {
    const dateObj = new Date(inputDate);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchPatients = async (consultantCode, date, search) => {
    try {
      const formattedDate = formatDate(date); // ✅ formats the selected date
      console.log(' date:', date);
      console.log('Formatted date:', formattedDate);

      const res = await getpatientList(
        consultantCode,
        formattedDate,
        search,
        '10',
        '0'
      );
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

      {/* Search field */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10, justifyContent: 'space-between' }}>
        {/* Doctor Selector */}

        <TextInput
          mode="outlined"
          placeholder="Search Patients"
          value={searchText}
          onChangeText={setSearchText}
          style={{
            flex: 1.2,
            marginLeft: 8,
            backgroundColor: '#fff',
            height: 35,
          }}
        />
        {/* Date Picker */}
        <TouchableOpacity
          onPress={() => {
            const today = new Date().toISOString().split('T')[0];
            setShowDatePicker(true);
            setSelectedDate(today); // Later replace with your own picker
          }}
          style={{ padding: 10, marginLeft: 8, backgroundColor: '#FFF', borderRadius: 8 }}
        >
          <Text>{selectedDate}</Text>
        </TouchableOpacity>

        {/* Search Input */}


        {/* + Icon */}
        <TouchableOpacity
          onPress={() => navigation.navigate('      Patients')}
          style={{
            marginLeft: 8,
            padding: 10,
            backgroundColor: '#2563EB',
            borderRadius: 8,
          }}
        >
          <Icon name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <DateTimePicker
        modal
        open={showDatePicker}
        date={new Date(selectedDate)}
        mode="date"
        onConfirm={selectedDate => {
          setSelectedDate(selectedDate.toISOString().split('T')[0]);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

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
        keyExtractor={(item) => item.regId.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              {expandedId !== item.regId && (
                <TouchableOpacity onPress={() => handleNavigate(item.regId, 0)}>
                  <Text style={styles.name}>
                    {item.patientName}
                  </Text>
                </TouchableOpacity>

              )}
              <TouchableOpacity onPress={() => toggleExpand(item.regId)}>
                <View style={{ transform: [{ rotate: expandedId === item.regId ? '90deg' : '0deg' }] }}>
                  <Icon
                    name="chevron-forward"
                    size={22}
                    color="#333"
                  />
                </View>
              </TouchableOpacity>
            </View>
            {expandedId === item.regId && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, }}>{item.patientName}</Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>{item.regDate}</Text>
                </View>
                {renderBottomTabStyle(item.regId)}
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

    </View >
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
    backgroundColor: '#F9FAFB',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingHorizontal: 16,
    // textAlign: 'center',
    color: '#2563EB',
    backgroundColor: '#F3F4F9',
    paddingVertical: 10,
    // borderRadius: 12,
  },
  card: {
    marginHorizontal: 16,
    padding: 12,
    // backgroundColor: 'grey',
    backgroundColor: '#E0E7FF',
    // backgroundColor: '#F3F4F9',
    marginBottom: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    // elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  bottomTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginTop: 16,
    elevation: 2,
  },
  tabButton: {
    alignItems: 'center',
    // marginHorizontal: 12,
    marginVertical: 8,
  },
  tabText: {
    fontSize: 13,
    color: '#374151',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 8,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  modalText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#111827',
  },
});
