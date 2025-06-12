import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PatientReport = ({ patientId }) => {
  const [photo, setPhoto] = useState(null);

  const handleCapturePhoto = () => {
    launchCamera({ mediaType: 'photo' }, response => {
      if (!response.didCancel && !response.errorCode && response.assets?.length) {
        setPhoto(response.assets[0]);
      }
    });
  };

  const handleChooseFromLibrary = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (!response.didCancel && !response.errorCode && response.assets?.length) {
        setPhoto(response.assets[0]);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Patient Report</Text>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Diagnosis:</Text>
          <Text style={styles.value}>Flu</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Prescribed Medicine:</Text>
          <Text style={styles.value}>Paracetamol</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Doctor's Note:</Text>
          <Text style={styles.value}>Rest for 3 days</Text>
        </View>
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleCapturePhoto}>
            <Icon name="camera-alt" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Capture Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleChooseFromLibrary}>
            <Icon name="photo-library" size={24} color="#FFFFFF" />
            <Text style={styles.buttonText}>Upload from Gallery</Text>
          </TouchableOpacity>
        </View>

        {photo && (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: photo.uri }} style={styles.image} resizeMode="contain" />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F6FA',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0A3C97',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    width: 150,
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  imageContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A3C97',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 2,
    flex: 0.48,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  imageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: 200,
  },
});

export default PatientReport;
