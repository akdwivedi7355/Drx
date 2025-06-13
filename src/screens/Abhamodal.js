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
  Dimensions,
  Platform,
} from 'react-native';
import { confirmAbhaOtp, initiateAbhaVerification, requestAbhaOtp } from '../api/api';

const { width } = Dimensions.get('window');

const THEME_COLORS = {
  primary: '#0A3C97',
  secondary: '#3B82F6',
  background: '#F5F6FA',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

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
          <View style={styles.headerContainer}>
            <Text style={styles.modalTitle}>ABHA Verification</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressIndicator, { width: `${(step / 3) * 100}%` }]} />
            </View>
          </View>
          <View style={styles.contentContainer}>
            {renderStepContent()}
          </View>
          <TouchableOpacity 
            onPress={() => { clearFields(); setmodelVisible(false); }} 
            style={styles.cancelButton}
          >
            <Text style={styles.cancelButtonText}>Close</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: THEME_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  headerContainer: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: THEME_COLORS.primary,
  },
  progressBar: {
    height: 4,
    backgroundColor: THEME_COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 2,
  },
  contentContainer: {
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  input: {
    borderWidth: 1.5,
    borderColor: THEME_COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: THEME_COLORS.surface,
    color: THEME_COLORS.text,
    fontWeight: '500',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: THEME_COLORS.surface,
    borderWidth: 1.5,
    borderColor: THEME_COLORS.border,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME_COLORS.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: THEME_COLORS.text,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  verifyButtonText: {
    color: THEME_COLORS.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: THEME_COLORS.surface,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME_COLORS.primary,
  },
  cancelButtonText: {
    color: THEME_COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
