import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

const PatientForm = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();

  const [patientID, setPatientID] = useState('');

  const fetchPatientData = async (id) => {
    if (!id) return;

    try {
      // Replace with your API call
      // Example: const response = await fetch(`https://your-api.com/patients/${id}`);
      // For demo, using mock data directly:
      const data = {
        consultantCode: '11',
        patientPrefix: 'Mr.',
        patientFirstName: 'Sarvesh',
        patientMiddleName: 'Kumar',
        patientLastName: 'Pandey',
        patientName: 'Sarvesh Kumar Pandey',
        genderCode: 'Male',
        patientDob: '24-Aug-1994',
        guardianPrefix: 'Mr.',
        guardianName: 'Nagendra Prasad Pandey',
        guardianRelationship: 'Father',
        patientMobile: '8419801975',
        patientEmail: "sarkumpan@gmail.com",
        address1: '119/508 Darshn Purwa, Kanpur-UP',
      };

      reset({
        fullName: data.patientName,
        mobile: data.patientMobile,
        email: data.patientEmail,
        age: '', // You can calculate age from DOB if needed
        gender: data.genderCode,
        address: data.address1,
        symptoms: '', // Symptoms are not in API
      });

    } catch (error) {
      reset({
        fullName: '',
        mobile: '',
        email: '',
        age: '',  // Reset other fields as needed
        gender: '',   
        address: '',
        symptoms: '',
      });
      console.error('Failed to fetch patient data:', error);
    }
  };

  const onSubmit = (data) => {
    console.log('Submitted Data:', data);
    reset();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Patient ID Field + Search Button */}
      <Text style={styles.label}>Patient ID</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Enter Patient ID"
          value={patientID}
          onChangeText={setPatientID}
          onBlur={() => fetchPatientData(patientID)} // Auto-fetch on blur
        />
        <TouchableOpacity onPress={() => fetchPatientData(patientID)} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Full Name */}
      <Text style={styles.label}>Full Name</Text>
      <Controller
        control={control}
        name="fullName"
        rules={{ required: 'Full name is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.fullName && <Text style={styles.error}>{errors.fullName.message}</Text>}

      {/* Mobile */}
      <Text style={styles.label}>Mobile Number</Text>
      <Controller
        control={control}
        name="mobile"
        rules={{
          required: 'Mobile number is required',
          pattern: {
            value: /^[0-9]{10}$/,
            message: 'Enter a valid 10-digit mobile number',
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter mobile number"
            keyboardType="number-pad"
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.mobile && <Text style={styles.error}>{errors.mobile.message}</Text>}

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <Controller
        control={control}
        name="email"
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: 'Enter a valid email address',
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            keyboardType="email-address"
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      {/* Age */}
      <Text style={styles.label}>Age</Text>
      <Controller
        control={control}
        name="age"
        rules={{
          required: 'Age is required',
          min: { value: 1, message: 'Must be at least 1' },
          max: { value: 120, message: 'Must be below 120' },
        }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter age"
            keyboardType="numeric"
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.age && <Text style={styles.error}>{errors.age.message}</Text>}

      {/* Gender */}
      <Text style={styles.label}>Gender</Text>
      <Controller
        control={control}
        name="gender"
        rules={{ required: 'Gender is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Enter gender"
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.gender && <Text style={styles.error}>{errors.gender.message}</Text>}

      {/* Address */}
      <Text style={styles.label}>Address</Text>
      <Controller
        control={control}
        name="address"
        rules={{ required: 'Address is required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, { height: 60 }]}
            placeholder="Enter address"
            multiline
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.address && <Text style={styles.error}>{errors.address.message}</Text>}

      {/* Symptoms */}
      <Text style={styles.label}>Symptoms</Text>
      <Controller
        control={control}
        name="symptoms"
        rules={{ required: 'Symptoms are required' }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, { height: 60 }]}
            placeholder="Enter symptoms"
            multiline
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.symptoms && <Text style={styles.error}>{errors.symptoms.message}</Text>}

      <View style={styles.buttonContainer}>
        <Button title="Submit" onPress={handleSubmit(onSubmit)} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchButton: {
    padding: 10,
    backgroundColor: '#4285F4',
    borderRadius: 5,
    marginLeft: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default PatientForm;
