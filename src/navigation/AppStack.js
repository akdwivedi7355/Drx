import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AppDrawer from './AppDrawer';
import PatientTabs from '../screens/PatientTabs';
import PatientForm from '../screens/Patients';
import DiagnosticSubmission from '../screens/submissiontabs/DiagnosticSubmission';
import PrescriptionSubmission from '../screens/submissiontabs/PrescriptionSubmission';
import MedicalBillSubmission from '../screens/submissiontabs/MedicalBillSubmission';

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
      <Stack.Screen
        name="DiagnosticSubmission"
        component={DiagnosticSubmission}
        options={{ title: 'Diagnostic Submission' }}
      />
      <Stack.Screen
        name="PrescriptionSubmission"
        component={PrescriptionSubmission}
        options={{ title: 'Prescription Submission' }}
      />
      <Stack.Screen
        name="MedicalBillSubmission"
        component={MedicalBillSubmission}
        options={{ title: 'Medical Bill Submission' }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
