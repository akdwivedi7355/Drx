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
    Dimensions,
} from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import { getUserDefaultDetails, saveMedicalBillReort } from '../../api/api';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const MedicalBillSubmission = ({ route }) => {
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
            const { scannedImages: newImages } = await DocumentScanner.scanDocument({
                croppedImageQuality: 10,
            });

            if (newImages.length > 0) {
                setScannedImages(prev => [...prev, ...newImages]);
            }
        } catch (error) {
            console.error('Scan error:', error);
        }
    };

    const removeImage = (indexToRemove) => {
        setScannedImages(prev => prev.filter((_, index) => index !== indexToRemove));
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
                try {
                    console.log('Processing image:', img);
                    const resized = await ImageResizer.createResizedImage(
                        img,
                        1000,  // width
                        1400,  // height
                        'JPEG',
                        90,    // quality
                        0,     // rotation
                        null,  // outputPath
                        false  // keep metadata
                    );

                    console.log('Resized image result:', resized);
                    const path = resized.uri.startsWith('file://') ? resized.uri : 'file://' + resized.uri;
                    optimizedImagePaths.push(path);
                } catch (resizeError) {
                    console.error('Image resize error:', resizeError);
                    throw new Error('Failed to optimize image for PDF conversion');
                }
            }

            console.log('Optimized image paths:', optimizedImagePaths);

            // Validate that we have paths after optimization
            if (optimizedImagePaths.length === 0) {
                throw new Error('No images were successfully optimized');
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

            const options = {
                html: htmlContent,
                fileName: `scanned_document_${Date.now()}`,
                directory: 'Documents',
                base64: true,
                width: 595,    // A4 width in points
                height: 842,   // A4 height in points
                quality: 0.9,  // Slightly reduced quality to ensure smaller file size
                bgColor: '#FFFFFF',
            };

            console.log('Converting to PDF with options:', options);
            const pdf = await RNHTMLtoPDF.convert(options);
            
            if (!pdf || !pdf.base64) {
                console.error('PDF generation failed - no base64 output');
                throw new Error('PDF generation failed - no base64 output');
            }

            console.log('PDF generation successful, base64 length:', pdf.base64?.length);
            console.log('First 50 chars of base64:', pdf.base64?.substring(0, 50));
            console.log('Last 50 chars of base64:', pdf.base64?.substring(pdf.base64.length - 50));

            // Check if the string contains any invalid characters
            const invalidChars = pdf.base64.match(/[^A-Za-z0-9+/=]/g);
            if (invalidChars) {
                console.error('Invalid characters found in base64:', [...new Set(invalidChars)]);
                
                // Try to clean the base64 string
                let cleanedBase64 = pdf.base64
                    .replace(/\s/g, '')  // Remove any whitespace
                    .replace(/[^A-Za-z0-9+/=]/g, ''); // Remove any invalid characters
                
                // Ensure proper padding
                while (cleanedBase64.length % 4) {
                    cleanedBase64 += '=';
                }
                
                if (/^[A-Za-z0-9+/]*={0,2}$/.test(cleanedBase64)) {
                    console.log('Successfully cleaned base64 string');
                    return cleanedBase64;
                }
            }

            // Validate the base64 string
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(pdf.base64)) {
                console.error('Base64 validation failed');
                throw new Error('Generated PDF data is not in valid base64 format');
            }

            return pdf.base64;

        } catch (error) {
            console.error('PDF creation error:', error);
            Alert.alert('Error', `PDF generation failed: ${error.message}`);
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
            console.log('Starting PDF conversion process...');
            const pdfBase64 = await convertImagesToPDFBase64(scannedImages);
            
            if (!pdfBase64) {
                console.error('PDF conversion returned null');
                Alert.alert('Error', 'Failed to generate PDF base64 data.');
                return;
            }

            console.log('PDF conversion successful, preparing to submit...');
            
            const patientData = {
                regDocid: Patient.regId,
                isDoc: true,
                consultantCode: Patient.consultantCode,
                uhid: Patient.uhid,
                rawData: pdfBase64,
            };

            console.log('Submitting to API with data length:', pdfBase64.length);

            const res = await saveMedicalBillReort(patientData);
            console.log('API Response:', JSON.stringify(res, null, 2));

            if (!res) {
                Alert.alert('Error', 'Failed to save patient data.');
                return;
            }
            
            if(res.status) {
                Alert.alert('Success', 'PDF submitted successfully.');
                handleClear(); 
                navigation.goBack();
            } else {
                const errorMsg = res.respDescription || res.errorMessage || 'Unknown error';
                console.error('API Error:', errorMsg);
                Alert.alert('Error', `Failed to submit PDF: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Submission error:', error);
            Alert.alert('Error', `Failed to submit PDF: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClear = () => {
        setScannedImages([]);
    }

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Icon name="file-document-outline" size={80} color="#0A3C97" />
            <Text style={styles.emptyStateTitle}>No Documents Yet</Text>
            <Text style={styles.emptyStateSubtitle}>
                Tap the scan button below to start scanning medical bills
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* <View style={styles.header}>
                <Text style={styles.headerTitle}>Medical Bill Submission</Text>
                {Patient.name && (
                    <Text style={styles.patientInfo}>
                        Patient: {Patient.name} ({Patient.uhid})
                    </Text>
                )}
            </View> */}

            <ScrollView 
                style={styles.content}
                contentContainerStyle={[
                    styles.scrollContent,
                    scannedImages.length === 0 && styles.centerContent
                ]}
            >
                {scannedImages.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <View style={styles.imageGrid}>
                        {scannedImages.map((uri, index) => (
                            <View key={index} style={styles.imageCard}>
                                <Image
                                    source={{ uri }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity 
                                    style={styles.removeButton}
                                    onPress={() => removeImage(index)}
                                >
                                    <Text style={styles.removeButtonText}>×</Text>
                                </TouchableOpacity>
                                <View style={styles.pageNumberContainer}>
                                    <Text style={styles.pageNumber}>Page {index + 1}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {isProcessing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0A3C97" />
                    <Text style={styles.loadingText}>Processing...</Text>
                </View>
            )}

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.button, styles.scanButton]} 
                    onPress={scanDocument}
                >
                    <Text style={styles.buttonText}>
                        {scannedImages.length === 0 ? 'Scan Document' : 'Scan More'}
                    </Text>
                </TouchableOpacity>

                {scannedImages.length > 0 && (
                    <>
                        <TouchableOpacity 
                            style={[styles.button, styles.clearButton]} 
                            onPress={handleClear}
                        >
                            <Text style={[styles.buttonText, styles.clearButtonText]}>
                                Clear All
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.button, styles.submitButton]} 
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        marginBottom: 20,
    },
    header: {
        backgroundColor: '#0A3C97',
        padding: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    patientInfo: {
        fontSize: 14,
        color: '#E0E7FF',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    centerContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    emptyStateContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0A3C97',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyStateSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        maxWidth: 250,
    },
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    imageCard: {
        width: (width - 44) / 2,
        height: (width - 44) / 2 * 1.4,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    removeButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 68, 68, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 24,
    },
    pageNumberContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pageNumber: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#0A3C97',
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 6,
    },
    button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 6,
        minHeight: 40,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    scanButton: {
        backgroundColor: '#0A3C97',
        flex: 1.5,
    },
    submitButton: {
        backgroundColor: '#059669',
        flex: 1,
    },
    clearButton: {
        backgroundColor: '#FFF1F1',
        borderWidth: 1,
        borderColor: '#FF4444',
        flex: 1,
    },
    clearButtonText: {
        color: '#FF4444',
        fontSize: 13,
    },
});

export default MedicalBillSubmission;
