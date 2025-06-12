/* eslint-disable curly */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-alert */
/* eslint-disable no-shadow */
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
  Modal,
  Pressable,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DateTimePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import ABHAModal from './Abhamodal';
import { useNavigation } from '@react-navigation/native';
import { AddPatients, getStoredDefaultConsultant, getUserDefaultDetails, verifyAbdmStatus, getdefaultconsultant } from '../api/api';
import LinearGradient from 'react-native-linear-gradient';

const PatientForm = () => {
  const { control, handleSubmit, setValue, watch, reset } = useForm();
  const [abdmID, setAbdmID] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [age, setAge] = useState('');
  const [modelVisible, setmodelVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [editable, setEditable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchDefaultDoctor = async () => {
      try {
        const res = await getUserDefaultDetails();
        const defaultres = {
          consultantCode: res.data.userLinkedConsultantCode,
          consultantName: res.data.userLinkedConsultantName,
          consultantInitial: 'Dr.',
        };
        setSelectedDoctor(defaultres);
      } catch (err) {
        console.error('Error fetching default doctor:', err);
      }
    };

    const fetchDoctors = async () => {
      try {
        const res = await getdefaultconsultant();
        if (res.status && res.data) {
          setDoctors(res.data);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };

    fetchDefaultDoctor();
    fetchDoctors();
  }, []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
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
      const response = await verifyAbdmStatus(type, trimmedID);

      if (response.status && response.data) {
        if (response.data.abhaNumber === undefined || response.data.abhaNumber === null) {
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

  const handleDoctorChange = (doctorCode) => {
    const doctor = doctors.find(d => d.consultantCode === doctorCode);
    setSelectedDoctor(doctor);
  };

  const onSubmit = async (data) => {
    if (!data.firstName || !data.lastName || !data.dob || !data.mobile) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a consultant');
      return;
    }

    setLoading(true);

    try {
      if (!data.name) {
        data.name = `${data.firstName} ${data.middleName || ''} ${data.lastName}`.trim();
      } else {
        data.name = data.name.trim();
      }

      const patientdata = {
        consultantCode: selectedDoctor.consultantCode,
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
      setLoading(false);
    }
  };

  const renderDoctorModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              activeOpacity={1} 
              style={styles.modalContent}
              onPress={e => e.stopPropagation()}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Doctor</Text>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {doctors.map((doctor) => (
                  <TouchableOpacity
                    key={doctor.consultantCode}
                    style={[
                      styles.doctorItem,
                      selectedDoctor?.consultantCode === doctor.consultantCode && styles.selectedDoctor,
                    ]}
                    onPress={() => {
                      setSelectedDoctor(doctor);
                      setModalVisible(false);
                    }}>
                    <Text style={[
                      styles.doctorName,
                      selectedDoctor?.consultantCode === doctor.consultantCode && styles.selectedDoctorText,
                    ]}>
                      {doctor.consultantInitial} {doctor.consultantName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Doctor Selection Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#0A3C97', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerGradient}>
          <TouchableOpacity
            style={styles.doctorSelectorHeader}
            onPress={() => setModalVisible(true)}>
            <View style={styles.doctorInfoHeader}>
              <Text style={styles.doctorLabelHeader}>Doctor</Text>
              <Text style={styles.doctorNameHeader} numberOfLines={1}>
                {selectedDoctor
                  ? `${selectedDoctor.consultantInitial} ${selectedDoctor.consultantName}`
                  : 'Select Doctor'}
              </Text>
            </View>
            <View style={styles.iconContainer}>
              <Icon name="chevron-down" size={18} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <KeyboardAvoidingView
        enabled
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          
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

          {/* <Button title="Verify ABHA" onPress={handleverifyabha} color="#102A68" /> */}

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
          <View style={[styles.row, { gap: 10 }]}>
            <View style={[styles.dropdownWrapper, { width: '65%' }]}>
              <Text style={styles.label}>Date Of Birth</Text>
              <Controller
                control={control}
                name="dob"
                render={({ field: { value } }) => (
                  <TouchableOpacity
                    onPress={editable ? () => setShowDatePicker(true) : null}
                    style={[
                      styles.inputSmall,
                      editable ? styles.editableInput : styles.disabledInput,
                    ]}
                    activeOpacity={editable ? 0.7 : 1}>
                    <Text style={[styles.dateText,
                    {
                      color: value ? '#102A68' : '#AAB6C3',
                    },
                    !editable && { color: '#888' }]}>
                      {value || 'Date of Birth'}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={[styles.dropdownWrapper, { width: '30%' }]}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={[
                  styles.inputSmall,
                  editable ? styles.editableInput : styles.disabledInput,
                ]}
                placeholder="Age"
                placeholderTextColor="#94A3B8"
                value={age}
                editable={false}
              />
            </View>
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
                          color: value ? '#102A68' : '#AAB6C3', 
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
                          color: value ? '#102A68' : '#AAB6C3', // Blue if selected, gray if not
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
                  {
                    height:80,
                  }
                ]}
                placeholder="Address"
                placeholderTextColor="#AAB6C3"
                value={value}
                onChangeText={onChange}
                editable={editable}
                selectTextOnFocus={editable}
                multiline={true}
                numberOfLines={2}
                textAlignVertical="top"
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
      </KeyboardAvoidingView>

      {renderDoctorModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  doctorSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  doctorInfoHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  doctorLabelHeader: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 6,
    opacity: 0.85,
  },
  doctorNameHeader: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  iconContainer: {
    padding: 2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F4F6FA',
  },
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
    marginBottom: 10,
  },
  rowgender: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 10,
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
    marginBottom: 10,
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
    marginBottom: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#102A68',
  },
  doctorItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectedDoctor: {
    backgroundColor: '#EBF5FF',
  },
  selectedDoctorText: {
    color: '#102A68',
    fontWeight: '600',
  },
});


export default PatientForm;
