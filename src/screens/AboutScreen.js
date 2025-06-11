import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Image, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AboutScreen = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    const features = [
        {
            icon: 'medical-outline',
            title: 'Healthcare Management',
            description: 'Comprehensive patient care and medical record management'
        },
        {
            icon: 'document-text-outline',
            title: 'Digital Prescriptions',
            description: 'Secure digital prescriptions and medical documentation'
        },
        {
            icon: 'analytics-outline',
            title: 'Health Analytics',
            description: 'Advanced analytics for better healthcare decisions'
        },
        {
            icon: 'shield-checkmark-outline',
            title: 'Data Security',
            description: 'HIPAA-compliant security for patient data protection'
        }
    ];

    const handleContactPress = () => {
        Linking.openURL('mailto:support@arogya.health');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="medical" size={40} color="#0A3C97" />
                        </View>
                        <Text style={styles.title}>Arogya Health Platform</Text>
                        <Text style={styles.subtitle}>Empowering Healthcare Through Technology</Text>
                    </View>
                </Animated.View>

                <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.sectionTitle}>Our Mission</Text>
                    <Text style={styles.sectionText}>
                        To revolutionize healthcare delivery by providing cutting-edge digital solutions that enhance patient care, streamline medical processes, and improve healthcare outcomes for everyone.
                    </Text>
                </Animated.View>

                <View style={styles.featuresContainer}>
                    {features.map((feature, index) => (
                        <Animated.View
                            key={index}
                            style={[styles.featureCard, {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }]
                            }]}
                        >
                            <Ionicons name={feature.icon} size={32} color="#0A3C97" />
                            <Text style={styles.featureTitle}>{feature.title}</Text>
                            <Text style={styles.featureDescription}>{feature.description}</Text>
                        </Animated.View>
                    ))}
                </View>

                <Animated.View style={[styles.contactSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.contactTitle}>Get in Touch</Text>
                    <TouchableOpacity style={styles.contactButton} onPress={handleContactPress}>
                        <Ionicons name="mail-outline" size={24} color="#FFFFFF" />
                        <Text style={styles.contactButtonText}>Contact Support</Text>
                    </TouchableOpacity>
                </Animated.View>

                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <Text style={styles.version}>Version 1.0.0</Text>
                    <Text style={styles.copyright}>© 2024 Arogya Health. All rights reserved.</Text>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E0E7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0A3C97',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#335589',
        textAlign: 'center',
        marginTop: 8,
    },
    section: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0A3C97',
        marginBottom: 12,
    },
    sectionText: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
    },
    featuresContainer: {
        padding: 16,
    },
    featureCard: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    featureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0A3C97',
        marginTop: 12,
        marginBottom: 8,
    },
    featureDescription: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    contactSection: {
        padding: 20,
        alignItems: 'center',
    },
    contactTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0A3C97',
        marginBottom: 16,
    },
    contactButton: {
        flexDirection: 'row',
        backgroundColor: '#0A3C97',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    contactButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    footer: {
        padding: 20,
        alignItems: 'center',
    },
    version: {
        fontSize: 14,
        color: '#6B7280',
    },
    copyright: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
});

export default AboutScreen;