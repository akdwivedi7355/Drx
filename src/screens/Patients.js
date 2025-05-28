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
  Button,
  Alert,
  Keyboard
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import ABHAModal from './Abhamodal';
import { verifyAbdmStatus } from '../api/api';

const PatientForm = () => {
  const { control, handleSubmit, setValue, watch, reset } = useForm();
  const [abdmID, setAbdmID] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState('');
  const [modelVisible, setmodelVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict(''); // Reset district when state changes
  };

  const stateDistrictData = {
    "UTTAR PRADESH": ["UNNAO", "KANPUR", "Lucknow"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
    // Add other states and their districts
  };


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


const handleABDMSearch = async () => {
  console.log('ABDM ID:', abdmID);

  if (!abdmID.trim()) return;

  // Determine type based on input pattern
  let type = '';
  const trimmedID = abdmID.trim();

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
        console.log('User Data:', stateDistrictData);

        setValue('firstName', user.name?.split(' ')[0] || '');
        setValue('middleName', user.name?.split(' ')[1] || '');
        setValue('lastName', user.name?.split(' ')[2] || '');
        setValue('dob', dateOfBirth);
        setValue('gender', user.gender === 'M' ? 'Male' : 'Female');
        setValue('mobile', user.mobile);
        setValue('email', '');
        setValue('address', user.address);
        setValue('state', user.state_name || '');
        setValue('district', user.district_name || '');
        // setValue(); // Store the ABDM ID in the form
        setSelectedDistrict(user.district_name || '');
        setSelectedState(user.state_name || '');

        // setSelectedState(itemValue);
          // setSelectedDistrict('');
          // setValue('district', '');

        setAge(calculatedAge.toString());


    } else {
      console.warn('ABDM search failed:', response.errorMessage || 'Unknown error');
    }
  } catch (err) {
    console.error('Error during ABDM search:', err);
  }
};

  const handleverifyabha  = () => {
    setmodelVisible(true);
  }

  const onSubmit = (data) => {
    console.log('Submitted Data:', data);
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    style={[styles.container, { paddingBottom: keyboardVisible ? 300 : 50 }]} // Adjust padding based on keyboard visibility
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

        <ABHAModal modelVisible={modelVisible} setmodelVisible={setmodelVisible}  setAbhaID={setAbdmID}  handleABDMSearch={handleABDMSearch} />

        {/* <Text style={styles.title}>Patient Registration Form</Text> */}

        {/* Name Row */}
        <View style={styles.row}>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.inputSmall ,{marginRight:10} ]}
                placeholder="First Name"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="middleName"
            render={({ field: { onChange, value } }) => (
              <TextInput
              style={[styles.inputSmall ,{marginRight:10} ]}
                placeholder="Middle Name"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.inputSmall}
                placeholder="Last Name"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
        </View>

        {/* DOB and Age Row */}
        <View style={styles.row}>
          <Controller
            control={control}
            name="dob"
            render={({ field: { value } }) => (
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputSmall}>
                <Text>{value || 'DOB (YYYY-MM-DD)'}</Text>
              </TouchableOpacity>
            )}
          />
          <TextInput
            style={[styles.inputSmall ,{ marginLeft:10}]}
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
          onConfirm={(selectedDate) => {
            setShowDatePicker(false);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setValue('dob', formattedDate);
            const calculatedAge = calculateAge(formattedDate);
            setAge(calculatedAge.toString());
          }}
          onCancel={() => setShowDatePicker(false)}
        />



        {/* Gender Dropdown */}
        <Controller
          control={control}
          name="gender"
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>
          )}
        />

{/* <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedState}
        onValueChange={handleStateChange}
        style={styles.picker}
      >
        <Picker.Item label="Select State" value="" />
        {Object.keys(stateDistrictData).map((state) => (
          <Picker.Item key={state} label={state} value={state} />
        ))}
      </Picker>
      </View> */}

      {/* District Picker */}
     {/* State Picker */}
<Controller
  control={control}
  name="state"
  render={({ field: { onChange, value } }) => (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={(itemValue) => {
          onChange(itemValue);
          setSelectedState(itemValue);
          setSelectedDistrict('');
          setValue('district', '');
        }}
        style={styles.picker}
      >
        <Picker.Item label="Select State" value="" />
        {Object.keys(stateDistrictData).map((state) => (
          <Picker.Item key={state} label={state} value={state} />
        ))}
      </Picker>
    </View>
  )}
/>

{/* District Picker */}
{watch('state') !== '' && (
  <Controller
    control={control}
    name="district"
    render={({ field: { onChange, value } }) => (
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={value}
          onValueChange={(itemValue) => {
            onChange(itemValue);
            setSelectedDistrict(itemValue);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select District" value="" />
          {(stateDistrictData[watch('state')] || []).map((district)=> (
            <Picker.Item key={district} label={district} value={district} />
          ))}
        </Picker>
      </View>
    )}
  />
)}


        {/* Mobile */}
        <Controller
          control={control}
          name="mobile"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
       


        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
            />
          )}
        />

        {/* Address */}
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={value}
              onChangeText={onChange}
              multiline
            />
          )}
        />

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Button title="Submit" onPress={handleSubmit(onSubmit)} />
          <Button title="Clear" onPress={() => { reset(); setAbdmID(''); setAge(''); }} color="red" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 10,
    backgroundColor: '#f5f7fa',
    paddingBottom: 50,
  },
  // scrollContainer: {
  //   paddingBottom: 60,
  // },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
    color: '#2c3e50',
  },
  abdmContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    // alignItems: 'center',
    // paddingHorizontal: 10,
  },
  inputSmall: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    
    // marginHorizontal: 5,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    // shadowOffset: { width: 0, height: 2 },
  },
  // input: {
  //   backgroundColor: '#fff',
  //   borderRadius: 10,
  //   padding: 12,
  //   fontSize: 16,
  //   marginBottom: 15,
  //   elevation: 2,
  //   shadowColor: '#000',
  //   shadowOpacity: 0.1,
  //   shadowOffset: { width: 0, height: 2 },
  // },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  picker: {
    height: 50,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
  },
  scrollContainer: {
    flexGrow: 1,
    // justifyContent: 'center',
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
  tabButtonActive: {
    backgroundColor: '#1F3C88',
    borderColor: '#1F3C88',
  },
  tabText: {
    color: '#1F3C88',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#AAB6C3',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    color: '#102A68',
    fontSize: 15,
  },
  otpButton: {
    backgroundColor: '#1F3C88',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  otpButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#0A3C97',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  switchMode: {
    alignItems: 'center',
    marginVertical: 8,
  },
  switchModeText: {
    color: '#1F3C88',
    fontWeight: '500',
  },
  abhaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // marginTop: ,
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
});


export default PatientForm;
