import React, {useState} from 'react';
import {View, Text, StyleSheet, Button, Image} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

const PatientReport = () => {
  const [photo, setPhoto] = useState(null);

  const handleCapturePhoto = () => {
    launchCamera({mediaType: 'photo'}, response => {
      if (
        !response.didCancel &&
        !response.errorCode &&
        response.assets?.length
      ) {
        setPhoto(response.assets[0]);
      }
    });
  };

  const handleChooseFromLibrary = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (
        !response.didCancel &&
        !response.errorCode &&
        response.assets?.length
      ) {
        setPhoto(response.assets[0]);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Patient Report</Text>
      <Text>Diagnosis: Flu</Text>
      <Text>Prescribed Medicine: Paracetamol</Text>
      <Text>Doctor's Note: Rest for 3 days</Text>

      <View style={styles.buttonContainer}>
        <Button title="Capture Report Photo" onPress={handleCapturePhoto} />
        <Button title="Upload from Gallery" onPress={handleChooseFromLibrary} />
      </View>

      {photo && (
        <Image
          source={{uri: photo.uri}}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

export default PatientReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    marginVertical: 20,
  },
  image: {
    width: '100%',
    height: 300,
    marginTop: 10,
    borderRadius: 10,
  },
});
