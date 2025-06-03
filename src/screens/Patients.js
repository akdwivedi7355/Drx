/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-alert */
/* eslint-disable no-shadow */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import ABHAModal from './Abhamodal';
import { useNavigation } from '@react-navigation/native';
import { AddPatients, getStoredDefaultConsultant, getUserDefaultDetails, verifyAbdmStatus } from '../api/api';

const PatientForm = () => {
  const { control, handleSubmit, setValue, watch, reset } = useForm();
  const [abdmID, setAbdmID] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState('');
  const [modelVisible, setmodelVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [editable, setEditable] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();



  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      console.log('Keyboard is visible');
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const calculateAge = (dobString) => {
    const today = new Date();
    const dob = new Date(dobString);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setValue('dob', formattedDate);
      const calculatedAge = calculateAge(formattedDate);
      setAge(calculatedAge.toString());
    }
  };

  const formatAbhaNumber = (number) => {
    // Return if already formatted
    if (number.includes('-')) {
      return number;
    }
    // Remove all non-digit characters
    let formattedNumber = number.replace(/\D/g, '');
    // Validate length
    if (formattedNumber.length !== 14) {
      alert('ABHA Number must be 14 digits');
      return '';
    }
    // Format as XX-XXXX-XXXX-XXXX
    return `${formattedNumber.slice(0, 2)}-${formattedNumber.slice(2, 6)}-${formattedNumber.slice(6, 10)}-${formattedNumber.slice(10)}`;
  };

  const handleABDMSearch = async () => {
    console.log('ABDM ID:', abdmID);

    if (!abdmID.trim()) {
      Alert.alert('Error', 'Please enter a valid ABHA address or Number');
      setEditable(true); // Make fields editable again
      handleclearFields(); // Clear fields if input is empty
      return;
    }

    // Determine type based on input pattern
    let type = '';
    let trimmedID = abdmID.trim();

    if (/^[\d-]+$/.test(trimmedID)) {
      // All numeric
      type = trimmedID.length < 5 ? '2' : '0'; // ia_Token or AbhaNumber

      if (trimmedID.length >= 14) {
        // Format ABHA Number
        const formattedNumber = formatAbhaNumber(trimmedID);
        if (!formattedNumber) return; // If formatting failed, exit
        setAbdmID(formattedNumber); // Update state with formatted number
        trimmedID = formattedNumber; // Use formatted number for search
      }
    } else {
      // Alphanumeric
      type = '1'; // AbhaAddress
    }

    try {
      console.log('Searching ABDM with type:', type, 'and ID:', trimmedID);
      const response = await verifyAbdmStatus(type, trimmedID);

      if (response.status && response.data) {
        if (response.data.abhaNumber === undefined || response.data.abhaNumber === null) {
          setEditable(true); // Make fields editable again
          handleclearFields();
          Alert.alert('ABDM Search Failed', response.data.statusRemark || 'ABDM Number not found');
          return;
        }
        const user = response.data;
        const { yearOfBirth, monthOfBirth, dayOfBirth } = user;

        if (!yearOfBirth || !monthOfBirth || !dayOfBirth) {
          console.warn('Incomplete DOB data:', { yearOfBirth, monthOfBirth, dayOfBirth });
          return;
        }

        const dateOfBirth = `${yearOfBirth}-${monthOfBirth.toString().padStart(2, '0')}-${dayOfBirth.toString().padStart(2, '0')}`;
        const calculatedAge = calculateAge(dateOfBirth);

        console.log('Date of Birth:', dateOfBirth);
        console.log('Calculated Age:', calculatedAge);

        const nameParts = user.name?.trim().split(/\s+/) || [];

        if (nameParts.length === 2) {
          // Only First and Last Name
          setValue('firstName', nameParts[0]);
          setValue('middleName', '');
          setValue('lastName', nameParts[1]);
        } else {
          // First, Middle, Last (or fallback to empty strings)
          setValue('firstName', nameParts[0] || '');
          setValue('middleName', nameParts[1] || '');
          setValue('lastName', nameParts[2] || '');
        }

        setValue('dob', dateOfBirth);
        setValue('gender', user.gender === 'M' ? 'Male' : 'Female');
        setValue('mobile', user.mobile);
        setValue('email', '');
        setValue('address', user.address);
        setValue('state', user.state_name || '');
        setValue('district', user.district_name || '');
        setValue('abhaNumber', user.abhaNumber || '');
        setValue('abhaAddress', user.abhaAddress || '');
        setValue('iAarogyaLinkedId', user.iAarogyaLinkedId || '');
        setValue('name', user.name || '');
        setEditable(false);
        setAge(calculatedAge.toString());
      } else {
        setEditable(true); // Make fields editable again
        handleclearFields();
        Alert.alert('ABDM Search Failed', response.errorMessage || 'Unknown error');
        console.warn('ABDM search failed:', response.errorMessage || 'Unknown error');
      }
    } catch (err) {
      handleclearFields();
      setEditable(true); // Make fields editable again
      Alert.alert('Error', 'Failed to search ABDM. Please try again.');
      console.error('Error during ABDM search:', err);
    }
  };

  const handleAutoABDMSearch = async (passingabdmsearchid) => {
    console.log('ABDM ID:', abdmID);

    if (!passingabdmsearchid.trim()) return;

    // Determine type based on input pattern
    let type = '';
    const trimmedID = passingabdmsearchid.trim();

    if (/^\d+$/.test(trimmedID)) {
      // All numeric
      type = trimmedID.length < 5 ? '2' : '0'; // ia_Token or AbhaNumber
    } else {
      // Alphanumeric
      type = '1'; // AbhaAddress
    }

    try {
      console.log('Searching ABDM with type:', type, 'and ID:', trimmedID);
      const response = await verifyAbdmStatus(type, trimmedID);

      if (response.status && response.data) {
        if (response.data.abhaNumber === undefined || response.data.abhaNumber === null) {
          handleclearFields();
          Alert.alert('ABDM Search Failed', response.data.statusRemark || 'ABDM Number not found');
          return;
        }
        const user = response.data;
        const { yearOfBirth, monthOfBirth, dayOfBirth } = user;

        console.log('User Data:', user);

        if (!yearOfBirth || !monthOfBirth || !dayOfBirth) {
          console.warn('Incomplete DOB data:', { yearOfBirth, monthOfBirth, dayOfBirth });
          return;
        }

        const dateOfBirth = `${yearOfBirth}-${monthOfBirth.toString().padStart(2, '0')}-${dayOfBirth.toString().padStart(2, '0')}`;
        const calculatedAge = calculateAge(dateOfBirth);

        console.log('Date of Birth:', dateOfBirth);
        console.log('Calculated Age:', calculatedAge);
        const nameParts = user.name?.trim().split(/\s+/) || [];

        if (nameParts.length === 2) {
          // Only First and Last Name
          setValue('firstName', nameParts[0]);
          setValue('middleName', '');
          setValue('lastName', nameParts[1]);
        } else {
          // First, Middle, Last (or fallback to empty strings)
          setValue('firstName', nameParts[0] || '');
          setValue('middleName', nameParts[1] || '');
          setValue('lastName', nameParts[2] || '');
        }
        setValue('dob', dateOfBirth);
        setValue('gender', user.gender === 'M' ? 'Male' : 'Female');
        setValue('mobile', user.mobile);
        setValue('email', '');
        setValue('address', user.address);
        setValue('state', user.state_name || '');
        setValue('district', user.district_name || '');
        setValue('abhaNumber', user.abhaNumber || '');
        setValue('abhaAddress', user.abhaAddress || '');
        setValue('iAarogyaLinkedId', user.iAarogyaLinkedId || '');
        setValue('name', user.name || '');
        // setValue('guardianName', user.guardianName || ''); // Add guardian name if available
        // setValue(); // Store the ABDM ID in the form

        // setSelectedState(itemValue);
        // setSelectedDistrict('');
        // setValue('district', '');

        setAge(calculatedAge.toString());


      } else {
        handleclearFields();
        Alert.alert('ABDM Search Failed', response.errorMessage || 'Unknown error');
        console.warn('ABDM search failed:', response.errorMessage || 'Unknown error');
      }
    } catch (err) {
      handleclearFields();
      Alert.alert('Error', 'Failed to search ABDM. Please try again.');
      console.error('Error during ABDM search:', err);
    }
  };

  const handleclearFields = () => {
    reset();
    setAbdmID('');
    setAge('');
    setmodelVisible(false);
    setEditable(true); // Reset editable state to true
  };

  const handleverifyabha = () => {
    setmodelVisible(true);
  };

  const formatDOB = (dob) => {
    if (!dob) return '';

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const [year, month, day] = dob.split('-');
    const monthName = months[parseInt(month, 10) - 1];

    return `${day}-${monthName}-${year}`;
  };


  const onSubmit = async (data) => {
    if (!data.firstName || !data.lastName || !data.dob || !data.mobile) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true); // 🔵 START loading

    try {
      const consultant = await getUserDefaultDetails();

      if (!data.name) {
        data.name = `${data.firstName} ${data.middleName || ''} ${data.lastName}`.trim();
      } else {
        data.name = data.name.trim();
      }


      const patientdata = {
        consultantCode: consultant?.data?.userLinkedConsultantCode,
        patientPrefix: data.patientPrefix,
        patientFirstName: data.firstName,
        patientMiddleName: data.middleName,
        patientLastName: data.lastName,
        patientName: data.name,
        patientGender: data.gender,
        patientDob: formatDOB(data.dob),
        patientMobile: data.mobile,
        patientEmail: data.email,
        address1: data.address,
        abhaNumber: data.abhaNumber,
        abhaAddress: data.abhaAddress,
        abhaMobile: data.mobile,
        iAarogyaLinkedId: data.iAarogyaLinkedId || null,
      };

      console.log('Patient Data:', patientdata);

      const apires = await AddPatients(patientdata);

      if (apires.status) {
        Alert.alert('Success', 'Patient registered successfully');
        handleclearFields();
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to register patient: ' + apires.errorMessage);
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong.');
      console.error('Submission error:', err);
    } finally {
      setLoading(false); // 🔴 END loading
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingBottom: keyboardVisible ? 0 : 50 }]} // Adjust padding based on keyboard visibility
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ABDM ID Input */}
        <View style={styles.abdmContainer}>
          <TextInput
            style={styles.abdmInput}
            placeholder="Enter ABHA address or Number"
            value={abdmID}
            onChangeText={setAbdmID}
            onBlur={handleABDMSearch}
          />
          {/* <Text style={styles.fixedText}>@abdm</Text> */}
          <TouchableOpacity onPress={handleABDMSearch}>
            <Icon name="search" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.abhaContainer}>
          <Text style={styles.abhaText}>Want to verify ABHA?</Text>
          <TouchableOpacity onPress={() => setmodelVisible(true)}>
            <Text style={styles.verifyAbha}> Verify ABHA</Text>
          </TouchableOpacity>
        </View>

        {/* <Button title="Verify ABHA" onPress={handleverifyabha} color="#007BFF" /> */}

        <ABHAModal
          modelVisible={modelVisible}
          setmodelVisible={setmodelVisible}
          setAbhaID={setAbdmID}
          handleAutoABDMSearch={handleAutoABDMSearch}
        />

        {/* <Text style={styles.title}>Patient Registration Form</Text> */}

        {/* Name Row */}
        <Text style={styles.label}>Patient Name</Text>
        <View style={styles.row}>

          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.inputSmall,
                  { marginRight: 10 },
                  editable ? styles.editableInput : styles.disabledInput,
                ]}
                placeholder="First"

                placeholderTextColor="#AAB6C3"
                value={value}
                onChangeText={onChange}
                editable={editable} // <-- Make it non-editable
                selectTextOnFocus={false} // Optional: prevent selecting text
              />
            )}
          />
          {/* <Controller
            control={control}
            name="middleName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.inputSmall, {marginRight:10}]}
                placeholder="Middle Name"
                value={value}
                onChangeText={onChange}
                editable={editable} // <-- Make it non-editable
                selectTextOnFocus={false} // Optional: prevent selecting text
              />
            )}
          /> */}

          <Controller
            control={control}
            name="middleName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.inputSmall,
                  { marginRight: 10 },
                  editable ? styles.editableInput : styles.disabledInput,
                ]}
                placeholder="Middle"

                placeholderTextColor="#AAB6C3"
                value={value}
                onChangeText={onChange}
                editable={editable}
                selectTextOnFocus={editable}
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.inputSmall,
                  { marginRight: 10 },
                  editable ? styles.editableInput : styles.disabledInput,
                ]}
                placeholder="Last"
                // placeholdertextsize="small"
                placeholderTextColor="#AAB6C3"
                value={value}
                onChangeText={onChange}
                editable={editable}
                selectTextOnFocus={false}
              />
            )}
          />
        </View>

        {/* DOB and Age Row */}
        <Text style={styles.label}>Date Of Birth</Text>
        <View style={styles.row}>
          <Controller
            control={control}
            name="dob"
            render={({ field: { value } }) => (
              <TouchableOpacity
                onPress={editable ? () => setShowDatePicker(true) : null}
                style={[
                  styles.inputSmall,
                  { justifyContent: 'center' },
                  editable ? styles.editableInput : styles.disabledInput,
                ]}
                activeOpacity={editable ? 0.7 : 1}>
                <Text style={[styles.dateText,
                {
                  color: value ? '#007BFF' : '#AAB6C3', // Blue if selected, gray if not
                },
                !editable && { color: '#888' }]}>
                  {value || 'Date of Birth'}
                </Text>
              </TouchableOpacity>
            )}
          />

          <TextInput
            style={[
              styles.inputSmall,
              { marginLeft: 10 },
              editable ? styles.editableInput : styles.disabledInput,
            ]}
            placeholder="Age"
            value={age}
            editable={false}
          />
        </View>


        <DateTimePicker
          modal
          open={showDatePicker}
          date={watch('dob') ? new Date(watch('dob')) : new Date()}
          mode="date"
          editable={editable}
          onConfirm={selectedDate => {
            setShowDatePicker(false);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setValue('dob', formattedDate);
            const calculatedAge = calculateAge(formattedDate);
            setAge(calculatedAge.toString());
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        {/* Gender Dropdown */}
        <View style={styles.inputRow}>
          <View style={styles.dropdownWrapper}>
            <Text style={styles.label}>Gender</Text>
            <Controller
              control={control}
              name="gender"
              render={({ field: { onChange, value } }) => (
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={value}
                    onValueChange={editable ? onChange : () => { }}
                    enabled={editable}
                    dropdownIconColor={'#AAB6C3'}
                    style={[
                      styles.picker,
                      {
                        color: value ? '#007BFF' : '#AAB6C3', // Blue if selected, gray if not
                      },
                      editable ? styles.editableInput : styles.disabledInput,
                    ]}>
                    <Picker.Item
                      label="Gender"
                      value=""
                      enabled={false}
                    />
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                    <Picker.Item label="Other" value="Other" />
                  </Picker>
                </View>
              )}
            />
          </View>

          <View style={styles.dropdownWrapper}>
            <Text style={styles.label}>Blood Group</Text>
            <Controller
              control={control}
              name="bloodgroup"
              render={({ field: { onChange, value } }) => (
                <View style={styles.pickerBox}>
                  <Picker
                    selectedValue={value}
                    onValueChange={editable ? onChange : () => { }}
                    enabled={editable}
                    style={[
                      styles.picker,
                      {
                        color: value ? '#007BFF' : '#AAB6C3', // Blue if selected, gray if not
                      },
                      editable ? styles.editableInput : styles.disabledInput,
                    ]}>
                    <Picker.Item label="Blood Group" value="" enabled={false} />
                    <Picker.Item label="A+" value="A+" />
                    <Picker.Item label="A-" value="A-" />
                    <Picker.Item label="B+" value="B+" />
                    <Picker.Item label="B-" value="B-" />
                    <Picker.Item label="O+" value="O+" />
                    <Picker.Item label="O-" value="O-" />
                    <Picker.Item label="AB+" value="AB+" />
                    <Picker.Item label="AB-" value="AB-" />
                  </Picker>
                </View>
              )}
            />
          </View>
        </View>
        <Text style={styles.label}>Mobile Number</Text>
        <Controller
          control={control}
          name="mobile"
          rules={{
            required: 'Mobile number is required',
            pattern: {
              value: /^\d{10}$/,
              message: 'Mobile number must be exactly 10 digits',
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <>
              <TextInput
                style={[
                  styles.input,
                  editable ? styles.editableInput : styles.disabledInput,
                  error && { borderColor: 'red' }, // highlight error
                ]}
                placeholder="Mobile Number"
                placeholderTextColor="#AAB6C3"
                keyboardType="phone-pad"
                value={value}
                onChangeText={onChange}
                editable={editable}
                selectTextOnFocus={editable}
                maxLength={10} // Optional: restrict input to 10 characters
              />
              {error && (
                <Text style={{ color: 'red', fontSize: 12 }}>
                  {error.message}
                </Text>
              )}
            </>
          )}
        />
        {/* Email Input */}
        <Text style={styles.label}>Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value }, fieldState: { error } }) => (

            <TextInput
              style={[
                styles.input,
                editable ? styles.editableInput : styles.disabledInput,
                // error && { borderColor: 'red' },
              ]}
              placeholder="Email"
              placeholderTextColor="#AAB6C3"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              editable={editable}
              selectTextOnFocus={editable}
              autoCapitalize="none"
            />
          )}
        />


        {/* Address */}
        <Text style={styles.label}>Address</Text>
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[
                styles.input,
                editable ? styles.editableInput : styles.disabledInput,
              ]}
              placeholder="Address"
              placeholderTextColor="#AAB6C3"
              value={value}
              onChangeText={onChange}
              editable={editable}
              selectTextOnFocus={editable}
              multiline
            />
          )}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.submitButton, loading && { backgroundColor: 'gray' }]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>



          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {

              handleclearFields();
            }}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    paddingBottom: 50,
  },
  // title: {
  //   fontSize: 24,
  //   fontWeight: '700',
  //   marginBottom: 25,
  //   textAlign: 'center',
  //   color: '#2c3e50',
  // },
  abdmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  abdmInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  fixedText: {
    marginHorizontal: 6,
    color: '#7f8c8d',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
    marginBottom: 10,
  },
  rowgender: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginBottom: 15,
  },
  inputSmall: {
    flex: 1,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    borderWidth: 1,
    borderColor: '#AAB6C3',
    borderRadius: 12,
    padding: 10,
    color: '#102A68',
    fontSize: 15,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#AAB6C3',
    color: '#102A68',
    fontSize: 15,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#102A68',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  submitButton: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
  },
  clearButton: {
    backgroundColor: 'grey',
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F4F6FA',
  },
  containerBox: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#102A68',
    textAlign: 'center',
    marginBottom: 5,
  },
  subHeader: {
    fontSize: 15,
    color: '#6078A0',
    textAlign: 'center',
    marginBottom: 25,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#1F3C88',
    marginHorizontal: 5,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#AAB6C3',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    color: '#102A68',
    fontSize: 15,
  },
  abhaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  abhaText: {
    color: '#6078A0',
  },
  verifyAbha: {
    color: '#0A3C97',
    fontWeight: '700',
    marginLeft: 5,
  },
  editableInput: {
    backgroundColor: '#ffffff',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  dateText: {
    fontSize: 16,
    color: '#102A68',
  },

  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },

  dropdownWrapper: {
    flex: 1,
  },

  label: {
    fontSize: 14,
    color: '#2E3A59',
    marginBottom: 6,
    fontWeight: '500',
  },

  pickerBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'left',
    height: 40,
    justifyContent: 'center',
  },

  // picker: {
  //   height: 45,
  //   width: '100%',
  //   color: '#102A68',
  // },
});


export default PatientForm;
