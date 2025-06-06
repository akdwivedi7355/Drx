import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DiagnosticSubmission = ({ route }) => {
    const { patient } = route.params;

    useEffect(() => {
        console.log('Patient:', patient);
    }, [patient]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                Patient History: {patient?.patientName}
            </Text>
            <Text>Last Visit: 2024-12-15</Text>
            <Text>Past Illnesses: Asthma, Migraine</Text>
        </View>
    );
};

export default DiagnosticSubmission;

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
