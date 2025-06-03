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
          marginLeft: -25,
          fontFamily: 'Roboto-Medium',
          fontSize: 15,
        },
      }}>
      <Drawer.Screen
        name="      Dashboard"
        headerShown={false}
        component={Dashboard}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={22} color={color} />
          ),
        }}
      />

      {/* <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="chatbox-ellipses-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Moments"
        component={MomentsScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="timer-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({color}) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
      /> */}
    </Drawer.Navigator>
  );
};

export default AppDrawer;
