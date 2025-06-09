import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PrescriptionSubmission = ({ route }) => {
    const { patient } = route.params;

    useEffect(() => {
        console.log('Prescription Submission for Patient:', patient);
    }, [patient]);

    if (!patient) {
        return (
            <View style={styles.container}>
                <Text>Loading prescription data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Prescription for: {patient?.patientName}
            </Text>
            <Text>Doctor: {patient?.doctorName || 'Dr. Sharma'}</Text>
            <Text>Date: {patient?.prescriptionDate || '2024-12-15'}</Text>
            <Text>Medications:</Text>
            {(patient?.medications || ['Paracetamol', 'Vitamin D']).map((med, index) => (
                <Text key={index}>• {med}</Text>
            ))}
            <Text>Instructions: {patient?.instructions || 'Take medications after meals.'}</Text>
        </View>
    );
};

export default PrescriptionSubmission;

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
});
