import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    Modal,
} from 'react-native';
import { Camera } from 'react-native-vision-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { useRoute } from '@react-navigation/native';

import ImageResizer from 'react-native-image-resizer';
import { getUserDefaultDetails, SaveSaleBillPatient } from '../../api/api';

const MedicalBillSubmission = ({ route }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [capturedImages, setCapturedImages] = useState([]);
    const [device, setDevice] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const cameraRef = useRef(null);
    const Patient = route.params?.patient || {};

    useEffect(() => {
        (async () => {
            const permission = await Camera.requestCameraPermission();
            setHasPermission(permission === 'granted');

            // Retry logic for camera devices
            let attempts = 0;
            let foundDevice = null;

            while (attempts < 5 && !foundDevice) {
                const devices = await Camera.getAvailableCameraDevices();
                const backCamera = devices.find(d => d.position === 'back');
                if (backCamera) {
                    foundDevice = backCamera;
                    break;
                }
                attempts++;
                await new Promise(res => setTimeout(res, 500)); // wait 500ms before retry
            }

            if (foundDevice) {
                setDevice(foundDevice);
            } else {
                Alert.alert("Error", "No camera devices found. Please try again.");
            }
        })();
    }, []);

    const takePhoto = async () => {
        if (!cameraRef.current) return;
        const photo = await cameraRef.current.takePhoto({
            qualityPrioritization: 'quality',
            flash: 'off',
        });
        setCapturedImages(prev => [...prev, photo]);
    };

    const removeImage = index => {
        const newImages = [...capturedImages];
        newImages.splice(index, 1);
        setCapturedImages(newImages);
    };


    const compressImages = async (images) => {
        const compressed = [];

        for (const img of images) {
            try {
                const compressedImage = await ImageResizer.createResizedImage(
                    img.path || img.uri,
                    800,
                    1100,
                    'JPEG',
                    60
                );

                // Make sure URI is correctly prefixed with file://
                const validPath = compressedImage.uri.startsWith('file://')
                    ? compressedImage.uri
                    : 'file://' + compressedImage.uri;

                compressed.push({ path: validPath });
            } catch (err) {
                console.error('Image compression failed:', err);
            }
        }

        return compressed;
    };

    const convertToPDFAndUpload = async () => {
        if (capturedImages.length === 0) {
            Alert.alert('No Image', 'Please capture at least one image.');
            return;
        }

        try {
            const compressedImages = await compressImages(capturedImages);

            const html = `
<html>
  <head>
    <style>
      @page { size: A4; margin: 5px; }
      body { margin: 0; padding: 0; }
      .image-container {
        page-break-after: always;
        text-align: center;
        padding: 5px;
      }
      img {
        max-width: 100%;
        height: auto;
      }
    </style>
  </head>
  <body>
    ${compressedImages.map(img => `
      <div class="image-container">
        <img src="${img.path}" />
      </div>
    `).join('')}
  </body>
</html>
`;

            const options = {
                html,
                fileName: `medical_bill_${Date.now()}`,
                directory: 'Documents',
                height: 1122,
                width: 793,
            };

            const file = await RNHTMLtoPDF.convert(options);

            // If needed, you can compress the PDF here using native modules or external service.
            // But RNHTMLtoPDF does not support native PDF compression directly.
            // Ensure image compression is sufficient.

            const base64 = await RNFS.readFile(file.filePath, 'base64');
            console.log('PDF created at:', file.filePath);
            console.log('PDF Base64:', base64); // Log first 100 chars for debugging

            console.log('Patient data:', Patient);
            const resdoc = await getUserDefaultDetails();
            const defaultres = {
                consultantCode: resdoc.data.userLinkedConsultantCode,
                consultantName: resdoc.data.userLinkedConsultantName,
                consultantInitial: 'Dr.',
            };

            const patientData = {
                regDocid: Patient.regId,
                isDoc: true,
                consultantCode: defaultres.consultantCode,
                uhid: Patient.uhid,
                rawData: base64,
            };

            console.log('Patient data to save:', patientData);

            const res = await SaveSaleBillPatient(patientData);
            if (!res) {
                Alert.alert('Error', 'Failed to save patient data.');
                return;
            }
            console.log('Patient data saved successfully:', res);

            Alert.alert('Success', 'PDF uploaded successfully!');
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to create/upload PDF.');
        }
    };


    if (!hasPermission || !device) {
        return (
            <View style={styles.center}>
                <Text>Waiting for camera...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {previewImage ? (
                <Modal transparent>
                    <View style={styles.previewContainer}>
                        <Image
                            source={{ uri: 'file://' + previewImage }}
                            style={styles.fullImage}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setPreviewImage(null)}>
                            <Ionicons name="close-circle" size={40} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </Modal>
            ) : (
                <>
                    <Camera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={true}
                        photo={true}
                    />
                    <View style={styles.controls}>
                        <TouchableOpacity onPress={takePhoto} style={styles.captureBtn}>
                            <Ionicons name="camera" size={30} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={convertToPDFAndUpload}
                            style={styles.submitBtn}>
                            <Text style={{ color: '#fff' }}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal style={styles.thumbnailScroll}>
                        {capturedImages.map((img, i) => (
                            <View key={i} style={styles.thumbContainer}>
                                <TouchableOpacity onPress={() => setPreviewImage(img.path)}>
                                    <Image
                                        source={{ uri: 'file://' + img.path }}
                                        style={styles.thumb}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.removeBtn}
                                    onPress={() => removeImage(i)}>
                                    <Ionicons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    controls: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    captureBtn: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 50,
    },
    submitBtn: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 8,
    },
    thumbnailScroll: {
        position: 'absolute',
        bottom: 100,
        paddingHorizontal: 10,
    },
    thumbContainer: {
        position: 'relative',
        marginRight: 10,
    },
    thumb: {
        width: 80,
        height: 80,
        borderRadius: 5,
    },
    removeBtn: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: 'red',
        borderRadius: 10,
        padding: 2,
    },
    previewContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
    },
});

export default MedicalBillSubmission;
