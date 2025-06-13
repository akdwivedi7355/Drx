/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PatientDetail from './tabs/PatientDetail';
import PrescriptionHistory from './tabs/PrescriptionHistory';
import GetSaveBill from './tabs/GetSaveBill';
import GetSaveDiagnostic from './tabs/GetSaveDiagnostic';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate
} from 'react-native-reanimated';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const PatientTabs = ({ route }) => {
  const { patientId, initialTab } = route.params || {};
  console.log(patientId, initialTab);
  const [fabVisible, setFabVisible] = useState(false);

  const rotation = useSharedValue(0);
  const menuAnimation = useSharedValue(0);

  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(rotation.value, [0, 1], [0, 90])}deg`,
        },
      ],
    };
  });

  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: menuAnimation.value,
      transform: [
        {
          scale: interpolate(menuAnimation.value, [0, 1], [0.5, 1]),
        },
      ],
    };
  });

  useEffect(() => {
    rotation.value = withSpring(fabVisible ? 1 : 0);
    menuAnimation.value = withTiming(fabVisible ? 1 : 0, { duration: 300 });
  }, [fabVisible]);

  const handleFabOption = (navigation, tabName) => {
    navigation.navigate(tabName);
    setFabVisible(false);
  };

  const renderTabScreen = (props, Component) => (
    <View style={{ flex: 1 }}>
      <Component {...props} patientId={patientId} />
      <AnimatedTouchable
        style={[styles.fab, fabAnimatedStyle]}
        onPress={() => setFabVisible(prev => !prev)}>
        <Icon
          name={fabVisible ? 'close' : 'add'}
          size={28}
          color="#fff"
        />
      </AnimatedTouchable>
      <Animated.View style={[styles.fabMenu, menuAnimatedStyle]}>
        {['Detail', 'Prescription', 'Bill', 'Diagnostic'].map((tabName, index) => (
          <TouchableOpacity
            key={tabName}
            onPress={() => handleFabOption(props.navigation, tabName)}
            style={[styles.fabItem, {
              backgroundColor: fabVisible ? '#fff' : 'transparent',
              transform: [{ translateY: fabVisible ? 0 : 20 }],
              transitionDelay: `${index * 100}ms`
            }]}>
            <Icon
              name={
                tabName === 'Detail' ? 'document-text' :
                  tabName === 'Prescription' ? 'time' :
                    tabName === 'Bill' ? 'receipt' : 'medical'
              }
              size={22}
              color="#0A3C97"
              style={styles.fabItemIcon}
            />
            <Text style={styles.fabText}>{tabName}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );

  return (
    <Tab.Navigator
      initialRouteName={
        initialTab === 1 ? 'Prescription' :
          initialTab === 2 ? 'Bill' :
            initialTab === 3 ? 'Diagnostic' : 'Detail'
      }
      screenOptions={{
        tabBarActiveTintColor: '#0A3C97',
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
        {props => renderTabScreen(props, PatientDetail)}
      </Tab.Screen>

      <Tab.Screen
        name="Prescription"
        options={{
          tabBarLabel: 'Prescription',
          tabBarIcon: ({ color, size }) => (
            <Icon name="time" size={size} color={color} />
          ),
        }}>
        {props => renderTabScreen(props, PrescriptionHistory)}
      </Tab.Screen>

      <Tab.Screen
        name="Bill"
        options={{
          tabBarLabel: 'Bill',
          tabBarIcon: ({ color, size }) => (
            <Icon name="receipt" size={size} color={color} />
          ),
        }}>
        {props => renderTabScreen(props, GetSaveBill)}
      </Tab.Screen>

      <Tab.Screen
        name="Diagnostic"
        options={{
          tabBarLabel: 'Diagnostic',
          tabBarIcon: ({ color, size }) => (
            <Icon name="medical" size={size} color={color} />
          ),
        }}>
        {props => renderTabScreen(props, GetSaveDiagnostic)}
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
    backgroundColor: '#0A3C97',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 10,
  },
  fabMenu: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 8,
    zIndex: 9,
    width: width * 0.4,
  },
  fabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  fabItemIcon: {
    marginRight: 12,
  },
  fabText: {
    fontSize: 16,
    color: '#0A3C97',
    fontWeight: '500',
  },
});
