/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import Dashboard from '../screens/Dashboard';
// import Patients from '../screens/Patients';
// import MomentsScreen from '../screens/MomentsScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import MessagesScreen from '../screens/MessagesScreen';
// import TabNavigator from './TabNavigator';

// Custom Drawer Component
import CustomDrawer from '../components/CustomDrawer';
import CustomHeader from '../components/CustomHeader';
import PatientForm from '../screens/Patients';
import PatientList from '../screens/PatientList';
import AboutScreen from '../screens/AboutScreen';
import ContactUsScreen from '../screens/ContactUsScreen';
// import LoadingScreen from '../screens/LoadingScreen';
// import AppStack from './AppStack';

const Drawer = createDrawerNavigator();

const AppDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        header: () => <CustomHeader />, // Add this line
        headerShown: true,
        // headerShown: false,
        drawerItemStyle: { paddingLeft: 10 }, // Adjust left padding for icon-label spacing
        // drawerLabelStyle: { marginLeft: -10 },
        drawerActiveBackgroundColor: '#0A3C97',
        drawerActiveTintColor: '#fff',
        drawerInactiveTintColor: '#333',
        drawerLabelStyle: {
          // marginLeft: -25,
          fontFamily: 'Roboto-Medium',
          fontSize: 15,
        },
      }}>
      <Drawer.Screen
        name="Dashboard"
        headerShown={false}
        component={Dashboard}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Patient List"
        headerShown={false}
        component={PatientList}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="people-outline" size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Users (Assistance)"
        component={PatientForm}
        headerShown={false}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="person-add-outline" size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="About"
        component={AboutScreen}
        headerShown={false}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="information-circle-outline" size={22} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="Contact Us"
        component={ContactUsScreen}
        headerShown={false}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="chatbubbles-outline" size={22} color={color} />
          ),
        }}
      />

    </Drawer.Navigator>
  );
};

export default AppDrawer;
