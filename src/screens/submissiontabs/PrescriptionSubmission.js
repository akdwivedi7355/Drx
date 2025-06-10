import React, { useState, useEffect } from 'react';
import {
    View,
    Alert,
    PermissionsAndroid,
    Platform,
    StyleSheet,
    Image,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Text,
} from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import { getUserDefaultDetails, SavePrescriptionReport } from '../../api/api';
import { NavigationContainer } from '@react-navigation/native';
// Navigation
import { useNavigation } from '@react-navigation/native';

const PrescriptionSubmission = ({ route }) => {
    const [scannedImages, setScannedImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [patientName, setPatientName] = useState('');
    const [patientID, setPatientID] = useState('');
    const Patient = route.params?.patient || {};
    // Add more as needed
    const navigation = useNavigation();

    useEffect(() => {
        requestStoragePermission();
    }, []);

    const requestStoragePermission = async () => {
        if (Platform.OS !== 'android') return true;
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission',
                    message: 'App needs access to save PDF files.',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
            console.error('Permission error:', error);
            return false;
        }
    };

    const scanDocument = async () => {
        if (
            Platform.OS === 'android' &&
            (await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA)) !==
            PermissionsAndroid.RESULTS.GRANTED
        ) {
            Alert.alert('Permission Denied', 'Camera permission is required.');
            return;
        }

        try {
            const { scannedImages } = await DocumentScanner.scanDocument({
                croppedImageQuality: 10,
            });

            if (scannedImages.length > 0) {
                setScannedImages(scannedImages);
            }
        } catch (error) {
            console.error('Scan error:', error);
        }
    };

    const convertImagesToPDFBase64 = async (images) => {
        try {
            if (images.length === 0) {
                Alert.alert('Error', 'No images to convert.');
                return null;
            }

            const optimizedImagePaths = [];

            // Resize images to fit A4 within reason
            for (const img of images) {
                const resized = await ImageResizer.createResizedImage(
                    img,
                    1000,
                    1400,
                    'JPEG',
                    90
                );

                const path = resized.uri.startsWith('file://') ? resized.uri : 'file://' + resized.uri;
                optimizedImagePaths.push(path);
            }

            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                @page {
                  size: A4;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  background-color: #FFFFFF;
                }
                .page {
                  page-break-after: always;
                  width: 100%;
                  height: 100vh;
                  padding: 0;
                  margin: 0;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-sizing: border-box;
                }
                .page:last-child {
                  page-break-after: auto;
                }
                .image-container {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  overflow: hidden;
                }
                img {
                  max-width: 100%;
                  max-height: 100%;
                  object-fit: contain;
                  margin: 0 auto;
                  display: block;
                }
              </style>
            </head>
            <body>
              ${optimizedImagePaths.map(
                (image) => `
                <div class="page">
                  <div class="image-container">
                    <img src="${image}" />
                  </div>
                </div>
              `
            ).join('')}
            </body>
            </html>
        `;

            const pdf = await RNHTMLtoPDF.convert({
                html: htmlContent,
                fileName: `scanned_document_${Date.now()}`,
                directory: 'Documents',
                base64: true, // to upload to API
                width: 595,    // A4 width in points
                height: 842,   // A4 height in points
                quality: 100,
                bgColor: '#FFFFFF',
            });

            return pdf.base64;

        } catch (error) {
            console.error('PDF creation error:', error);
            Alert.alert('Error', 'PDF generation failed.');
            return null;
        }
    };


    const handleSubmit = async () => {
        if (scannedImages.length === 0) {
            Alert.alert('Error', 'No scanned images to submit.');
            return;
        }

        setIsProcessing(true);

        try {
            const pdfBase64 = await convertImagesToPDFBase64(scannedImages);
            console.log('PDF Base64:', pdfBase64);
            if (!pdfBase64) return;

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
                rawData: pdfBase64,
            };

            console.log('Patient data to save:', patientData);

            const res = await SavePrescriptionReport(patientData);
            if (!res) {
                Alert.alert('Error', 'Failed to save patient data.');
                return;
            }
            Alert.alert('Success', 'PDF submitted successfully.');
            handleClear(); // Clear images after successful submission
            navigation.goBack(); // Navigate back after submission

        } catch (error) {
            console.error('Submission error:', error);
            Alert.alert('Error', 'Failed to submit PDF.');
        } finally {
            setIsProcessing(false);
        }
    };


    const handleClear = () => {
        setScannedImages([]);
    }





    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.imageContainer}>
                {scannedImages.map((uri, index) => (
                    <Image
                        key={index}
                        source={{ uri }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                ))}
                {isProcessing && <ActivityIndicator size="large" color="#007AFF" />}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={scanDocument}>
                    <Text style={styles.buttonText}>Scan  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleSubmit}
                    style={[styles.button, styles.submitButton]}
                >
                    <Text style={styles.buttonText}>Submit</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

export default PrescriptionSubmission;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    imageContainer: {
        padding: 10,
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 300,
        marginVertical: 10,
        borderRadius: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#f8f8f8',
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        flex: 1,
        backgroundColor: '#007AFF',
        paddingVertical: 14,
        marginHorizontal: 5,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    submitButton: {
        backgroundColor: '#28a745',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
