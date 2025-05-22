import React, {useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const patients = [
  {id: '1', name: 'Ramesh'},
  {id: '2', name: 'hello'},
];

export default function Dashboard() {
  const [expandedId, setExpandedId] = useState(null);
  const navigation = useNavigation();

  const toggleExpand = id => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleNavigate = (patientId, tab) => {
    navigation.navigate('PatientTabs', {patientId, initialTab: tab});
  };

  const renderBottomTabStyle = patientId => (
    <View style={styles.bottomTabs}>
      {['Details', 'Report', 'History'].map((label, i) => (
        <TouchableOpacity
          key={label}
          style={styles.tabButton}
          onPress={() => handleNavigate(patientId, i)}>
          {/* <Icon name="chevron-back" size={18} color="#555" /> */}
          <Text style={styles.tabText}>{label}</Text>
          {/* <Icon name="chevron-forward" size={18} color="#555" /> */}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.doctorName}>Dr. Aditya Kumar</Text>
      <FlatList
        data={patients}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeader}>
              {expandedId !== item.id && (
                <Text style={styles.name}>{item.name}</Text>
              )}
              <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                <Icon
                  name={
                    expandedId === item.id ? 'chevron-down' : 'chevron-forward'
                  }
                  size={22}
                />
              </TouchableOpacity>
            </View>

            {/* Expanded Content */}
            {expandedId === item.id && renderBottomTabStyle(item.id)}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  doctorName: {fontSize: 22, fontWeight: 'bold', marginBottom: 20},
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
  name: {fontSize: 18, fontWeight: '600'},
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 16,
    elevation: 3,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
