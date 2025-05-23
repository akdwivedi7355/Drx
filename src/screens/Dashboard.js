import React, { useState } from 'react';
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

const doctors = [
  { id: 'd1', name: 'Dr. Aditya Kumar' },
  { id: 'd2', name: 'Dr. Priya Singh' },
  { id: 'd3', name: 'Dr. Raj Mehta' },
];

const allPatients = {
  d1: [
    { id: '1', name: 'Ramesh' },
    { id: '2', name: 'Suresh' },
  ],
  d2: [{ id: '3', name: 'Anjali' }],
  d3: [{ id: '4', name: 'Vikram' }],
};

const iconMap = {
  Details: 'person-outline',
  Report: 'document-text-outline',
  History: 'time-outline',
  Prescriptions: 'medkit-outline',
  Vitals: 'fitness-outline',
};

export default function Dashboard() {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(doctors[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

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
          onPress={() => handleNavigate(patientId, i)}>
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
        <Text style={styles.doctorName}>{selectedDoctor.name} ⌄</Text>
      </TouchableOpacity>

      {/* Modal for Doctor Selection */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {doctors.map(doc => (
              <Pressable
                key={doc.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedDoctor(doc);
                  setExpandedId(null);
                  setModalVisible(false);
                }}>
                <Text style={styles.modalText}>{doc.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Patient List */}
      <FlatList
        data={allPatients[selectedDoctor.id]}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              {expandedId !== item.id && <Text style={styles.name}>{item.name}</Text>}
              <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                <Icon
                  name={expandedId === item.id ? 'chevron-down' : 'chevron-forward'}
                  size={22}
                />
              </TouchableOpacity>
            </View>
            {expandedId === item.id && renderBottomTabStyle(item.id)}
          </View>
        )}
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
