import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { initiateAbhaVerification } from '../api/api';

const ABHAModal = ({ modelVisible, setmodelVisible }) => {
  const [inputId, setInputId] = useState('');
  const [selectedMode, setSelectedMode] = useState(null);

  const verificationModes = [
    { id: 'abhaNumber', label: 'ABHA Number', placeholder: 'Enter ABHA Number' },
    { id: 'abhaAddress', label: 'ABHA Address', placeholder: 'Enter ABHA Address' }
  ];

  const toggleMode = (mode) => {
    setSelectedMode(mode === selectedMode ? null : mode);
    setInputId(''); // reset input when mode changes
  };

  const nextStep = async () => {
    if (!inputId) {
      alert('Please enter your ABHA details');
      return;
    }
    const res = await initiateAbhaVerification(inputId);
    if(res){
        console.log('ABHA verification initiated successfully:', res);
        // alert('ABHA verification initiated successfully');
        }
    // Handle the next step logic here, e.g., API call or navigation
    console.log(`Selected Mode: ${selectedMode}, Input ID: ${inputId}`);
    // setmodelVisible(false); // Close the modal after next step
  };

  const selectedOption = verificationModes.find((m) => m.id === selectedMode);

  return (
    <Modal visible={modelVisible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Enter ABHA Details</Text>
          <Text style={styles.subTitle}>Select Verification Mode</Text>

          <View style={styles.radioGroup}>
            {verificationModes.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={styles.radioOption}
                onPress={() => toggleMode(mode.id)}
                activeOpacity={0.7}
              >
                <View style={styles.radioOuter}>
                  {selectedMode === mode.id && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{mode.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subTitle}>
            {selectedOption ? `Enter ${selectedOption.label}` : 'Enter ABHA Number or Address'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder={selectedOption ? selectedOption.placeholder : 'Enter ABHA ID'}
            value={inputId}
            onChangeText={setInputId}
            keyboardType={selectedMode === 'abhaNumber' ? 'numeric' : 'default'}
          />

          <TouchableOpacity 
            onPress={nextStep}
          style={styles.verifyButton}>
            <Text style={styles.verifyButtonText}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setmodelVisible(false)}
            style={styles.cancelButton}
          >
            <Text style={{ color: '#999' }}>Cancel</Text>
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
    backgroundColor: '#27ae60',
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
    alignItems: 'center',
    marginTop: 10,
  },
  radioGroup: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
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
  }
  
});
