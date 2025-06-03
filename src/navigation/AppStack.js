// src/navigation/AppStack.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AppDrawer from './AppDrawer';
import PatientTabs from '../screens/PatientTabs';
import PatientForm from '../screens/Patients';

const Stack = createStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeDrawer"
        component={AppDrawer}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Patient Registration"
        component={PatientForm}
        options={{ title: 'Patient Registration' }}
      />
      <Stack.Screen
        name="PatientTabs"
        component={PatientTabs}
        options={{ title: 'Patient Details' }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
