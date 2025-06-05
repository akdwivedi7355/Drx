/* eslint-disable react-native/no-inline-styles */
/* eslint-disable curly */
/* eslint-disable no-alert */
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { confirmAbhaOtp, initiateAbhaVerification, requestAbhaOtp } from '../api/api';

const ABHAModal = ({ modelVisible, setmodelVisible, setAbhaID, handleAutoABDMSearch }) => {
  const [inputId, setInputId] = useState('');
  const [selectedMode, setSelectedMode] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableModes, setAvailableModes] = useState([]);
  const [otp, setOtp] = useState('');
  const [abhaData, setAbhaData] = useState(null);
  const [transactionId, setTransactionId] = useState(null);

  const verificationModes = [
    { id: 'abhaNumber', label: 'ABHA Number', placeholder: 'Enter ABHA Number' },
    { id: 'abhaAddress', label: 'ABHA Address', placeholder: 'Enter ABHA Address' },
  ];

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

  const handleNext = async () => {
    if (!inputId) return alert('Please enter your ABHA details');
    if (!selectedMode) return alert('Please select a verification mode');

    let payload = {};

    setLoading(true);
    try {
      if (selectedMode === 'abhaNumber') {
        payload = {
          abhaNumber: formatAbhaNumber(inputId), // Format ABHA Number
          initMode: '0', // Assuming '0' is the default mode
        };
      }
      if (selectedMode === 'abhaAddress') {
        payload = {
          abhaAddress: inputId,
          initMode: '0', // Assuming '0' is the default mode
        };
      }
      const res = await initiateAbhaVerification(payload); // API call
      if (!res.status) {
        // console.error('Verification failed:', res.errorMessage);
        setLoading(false);
        return alert('Verification failed: ' + res.errorMessage);
      }
      setAbhaData(res.data);
      setAvailableModes(res?.data?.modes || []);
      setStep(2); // move to next step
    } catch (err) {
      alert('Verification failed');
    }
    setLoading(false);
  };

  const handleModeSelect = async (mode) => {
    setSelectedMode(mode);
    setLoading(true);


    try {
      const response = await requestAbhaOtp(abhaData.ia_Token, abhaData.abhaTokenId, mode, inputId); // Replace with real API
      // simu late API delay
      // await new Promise(resolve => setTimeout(resolve, 1000));
      if (response.status) {
        setTransactionId(response.data.transactionId); // Store transaction ID if needed
        setStep(3);
        alert('OTP sent successfully!');
      } else {
        console.error('OTP Request Failed:', response.errorMessage);
        alert('Failed to send OTP: ' + response.errorMessage);
      }
    } catch (err) {
      alert('Failed to initiate OTP');
    }
    setLoading(false);
  };

  const handleOtpVerify = async () => {
    if (!otp) return alert('Please enter OTP');
    setLoading(true);
    try {
      const response = await confirmAbhaOtp(abhaData.abhaTokenId, abhaData.ia_Token, abhaData.abhaAddress, abhaData.abhaNumber, transactionId, otp, selectedMode);
      // alert('Verification successful!');
      if (response.status) {
        setmodelVisible(false);
        setStep(1); // Reset to first step
        setAbhaID(abhaData.abhaAddress);
        handleAutoABDMSearch(abhaData.abhaAddress);
        clearFields();
        alert('Verification successful!');
      } else {
        alert('Verification failed: ' + response.respDescription);
      }
    } catch (err) {
      alert('Invalid OTP');
    }
    setLoading(false);
  };

  const clearFields = () => {
    setInputId('');
    setSelectedMode(null);
    setStep(1);
    setLoading(false);
    setAvailableModes([]);
    setOtp('');
    setAbhaData(null);
    setTransactionId(null);
  };

  const selectedOption = verificationModes.find((m) => m.id === selectedMode);

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <>
          <Text style={styles.subTitle}>Select Verification Mode</Text>
          {verificationModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={styles.radioOption}
              onPress={() => {
                setSelectedMode(mode.id);
                setInputId('');
              }}
            >
              <View style={styles.radioOuter}>
                {selectedMode === mode.id && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>{mode.label}</Text>
            </TouchableOpacity>
          ))}

          <TextInput
            style={styles.input}
            placeholder={selectedOption ? selectedOption.placeholder : 'Enter ABHA details'}
            value={inputId}
            onChangeText={setInputId}
            keyboardType={selectedMode === 'abhaNumber' ? 'numeric' : 'email-address'}
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.verifyButton} onPress={handleNext}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyButtonText}>Next</Text>}
          </TouchableOpacity>
        </>
      );
    } else if (step === 2) {
      return (
        <>
          <Text style={styles.subTitle}>Select Authentication Mode</Text>
          {availableModes.map((mode) => (
            <TouchableOpacity
              value={mode}
              key={mode}

              style={styles.radioOption}
              // style={[styles.otpButton, selectedMode === mode && styles.selectedButton]}
              onPress={() => handleModeSelect(mode)}
            >
              <View style={styles.radioOuter}>
                {selectedMode === mode.id && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>{mode}</Text>
            </TouchableOpacity>
          ))}
          {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
        </>
      );
    } else if (step === 3) {
      return (
        <>
          <Text style={styles.subTitle}>Enter OTP</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.verifyButton} onPress={handleOtpVerify}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyButtonText}>Verify</Text>}
          </TouchableOpacity>
        </>
      );
    }
  };

  return (
    <Modal visible={modelVisible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>ABHA Verification</Text>
          {renderStepContent()}
          <TouchableOpacity onPress={() => { clearFields(); setmodelVisible(false); }} style={styles.cancelButton}>
            <Text style={styles.cancelBttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ABHAModal;




const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  otpOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpButton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: '#3498db',
    borderWidth: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#3498db',
  },
  otpButtonText: {
    color: '#3498db',
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 10,
    // backgroundColor: '#e74c3c',
    backgroundColor: '#bdc3c7',
    borderColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelBttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  radioGroup: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3498db',
  },
  radioLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
});
