import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MedicalBillSubmission = ({ route }) => {
    const { patient } = route.params;

    useEffect(() => {
        console.log('Medical Bill Submission for Patient:', patient);
    }, [patient]);

    if (!patient) {
        return (
            <View style={styles.container}>
                <Text>Loading patient billing data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Medical Bill for: {patient?.patientName}
            </Text>
            <Text>Patient ID: {patient?.id || 'N/A'}</Text>
            <Text>Total Amount: ₹{patient?.totalBill || 'N/A'}</Text>
            <Text>Payment Status: {patient?.paymentStatus || 'Pending'}</Text>
            <Text>Date Issued: {patient?.billDate || '2024-12-15'}</Text>
        </View>
    );
};

export default MedicalBillSubmission;

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
