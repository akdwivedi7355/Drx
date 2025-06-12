import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AppDrawer from './AppDrawer';
import PatientTabs from '../screens/PatientTabs';
import PatientForm from '../screens/Patients';
import DiagnosticSubmission from '../screens/submissiontabs/DiagnosticSubmission';
import PrescriptionSubmission from '../screens/submissiontabs/PrescriptionSubmission';
import MedicalBillSubmission from '../screens/submissiontabs/MedicalBillSubmission';
import { Platform } from 'react-native';
import CustomStackHeader from '../components/CustomStackHeader';
import CustomSafeArea from '../components/CustomSafeArea';

const Stack = createStackNavigator();

const screenOptions = {
  header: (props) => <CustomStackHeader {...props} />,
  headerStyle: {
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
    borderBottomWidth: 0, // Remove the bottom border
  },
  cardStyle: { backgroundColor: '#F9FAFB' },
};

const AppStack = () => {
  return (
    
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name="HomeDrawer"
          component={AppDrawer}
          options={{ headerShown: false, headerTitle: 'Dashboard' }}
        />
        <Stack.Screen
          name="Patient Registration"
          component={PatientForm}
        />
        <Stack.Screen
          name="PatientTabs"
          component={PatientTabs}
          options={{ title: 'Patient Panel' }}
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
