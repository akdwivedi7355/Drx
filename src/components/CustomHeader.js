import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getStoredUserDetails } from '../api/api'; // Adjust path as needed
import { useNavigation, useRoute } from '@react-navigation/native';

const CustomHeader = () => {
    const [siteName, setSiteName] = useState('');
    const navigation = useNavigation();
    const route = useRoute();

    useEffect(() => {
        const fetchSiteName = async () => {
            try {
                const userDetails = await getStoredUserDetails();
                if (userDetails?.facilityName) {
                    setSiteName(userDetails.facilityName);
                }
            } catch (err) {
                console.error('Failed to fetch user details:', err);
            }
        };

        fetchSiteName();
    }, []);

    return (
        <View style={styles.header}>
            <View style={styles.leftSection}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu" size={24} color="#fff" style={{ marginRight: 10 }} />
                </TouchableOpacity>
                <Text style={styles.pageTitle}>{route.name.trim()}</Text>
            </View>
            <Text style={styles.siteName}>{siteName}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 40,
        backgroundColor: '#0A3C97',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        elevation: 4,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pageTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    siteName: {
        color: '#fff',
        fontSize: 14,
        fontStyle: 'italic',
        maxWidth: '50%',
        textAlign: 'right',
    },
});

export default CustomHeader;
