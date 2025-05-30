/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PatientDetail from './tabs/PatientDetail';
import PatientReport from './tabs/PatientReport';
import PatientHistory from './tabs/PatientHistory';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const PatientTabs = ({ route }) => {
  const { patientId, initialTab } = route.params || {};
  const [fabVisible, setFabVisible] = useState(false);

  const handleFabOption = (navigation, tabName) => {
    navigation.navigate(tabName);
    setFabVisible(false);
  };
  return (
    <Tab.Navigator
      initialRouteName={
        initialTab === 1 ? 'Report' : initialTab === 2 ? 'History' : 'Detail'
      }
      screenOptions={{
        tabBarActiveTintColor: 'purple',
        tabBarStyle: { backgroundColor: '#f8f8f8' },
        headerShown: false,
      }}>
      <Tab.Screen
        name="Detail"
        options={{
          tabBarLabel: 'Detail',
          tabBarIcon: ({ color, size }) => (
            <Icon name="document-text" size={size} color={color} />
          ),
        }}>
        {props => (
          <View style={{ flex: 1 }}>
            <PatientDetail {...props} patientId={patientId} />
            {fabVisible && (
              <View style={styles.fabMenu}>
                {['Detail', 'Report', 'History'].map(tabName => (
                  <TouchableOpacity
                    key={tabName}
                    onPress={() => handleFabOption(props.navigation, tabName)}
                    style={styles.fabItem}>
                    <Text style={styles.fabText}>{`Go to ${tabName}`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setFabVisible(prev => !prev)}>
              <Icon
                name={fabVisible ? 'close' : 'add'}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Report"
        options={{
          tabBarLabel: 'Report',
          tabBarIcon: ({ color, size }) => (
            <Icon name="bar-chart" size={size} color={color} />
          ),
        }}>
        {props => (
          <View style={{ flex: 1 }}>
            <PatientReport {...props} patientId={patientId} />
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setFabVisible(prev => !prev)}>
              <Icon
                name={fabVisible ? 'close' : 'add'}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
            {fabVisible && (
              <View style={styles.fabMenu}>
                {['Detail', 'Report', 'History'].map(tabName => (
                  <TouchableOpacity
                    key={tabName}
                    onPress={() => handleFabOption(props.navigation, tabName)}
                    style={styles.fabItem}>
                    <Text style={styles.fabText}>{`Go to ${tabName}`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </Tab.Screen>

      <Tab.Screen
        name="History"
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Icon name="time" size={size} color={color} />
          ),
        }}>
        {props => (
          <View style={{ flex: 1 }}>
            <PatientHistory {...props} patientId={patientId} />
            <TouchableOpacity
              style={styles.fab}
              onPress={() => setFabVisible(prev => !prev)}>
              <Icon
                name={fabVisible ? 'close' : 'add'}
                size={28}
                color="#fff"
              />
            </TouchableOpacity>
            {fabVisible && (
              <View style={styles.fabMenu}>
                {['Detail', 'Report', 'History'].map(tabName => (
                  <TouchableOpacity
                    key={tabName}
                    onPress={() => handleFabOption(props.navigation, tabName)}
                    style={styles.fabItem}>
                    <Text style={styles.fabText}>{`Go to ${tabName}`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default PatientTabs;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 70,
    right: 30,
    backgroundColor: '#aa18ea',
    borderRadius: 50,
    padding: 16,
    elevation: 5,
    zIndex: 10,
  },
  fabMenu: {
    position: 'absolute',
    bottom: 140,
    right: 30,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    elevation: 5,
    zIndex: 9,
  },
  fabItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  fabText: {
    fontSize: 16,
    color: '#333',
  },
});
