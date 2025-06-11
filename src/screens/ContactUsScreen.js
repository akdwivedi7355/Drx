import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ContactUsScreen = () => {
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

    const officeLocations = [
        {
            title: 'Head Office',
            address: '25/16, Karachi Khana,\nKanpur – 208001(U.P),\nIndia.',
            icon: 'business'
        },
        {
            title: 'Mumbai Office',
            address: '201, Ghanshyam Enclave,\nNew Link Rd, Mahatma Gandhi Nagar,\nKandivali West, Mumbai – 400067 India.',
            icon: 'business'
        },
        {
            title: 'Delhi Office',
            address: '316, Competent House, F Block,\nConnaught Place, New Delhi – 110008 India.',
            icon: 'business'
        },
        {
            title: 'Bengaluru Office',
            address: 'S-104, South Block, Manipal Center,\nMahatma Gandhi Rd, Yellappa Garden,\nYellappa Chetty Layout, Ashok Nagar,\nKarnataka 560025',
            icon: 'business'
        }
    ];

    const quickLinks = [
        'Support Desk', 'Request Demo', 'Be Our Partner', 'Pay Now',
        'Contact Us', 'More Information', 'Blog', 'Customer Service Request',
        'Know Your Customer', 'Government Services', 'Careers'
    ];

    const handleEmailPress = () => {
        Linking.openURL('mailto:shweta@dataman.in');
    };

    const handlePhonePress = () => {
        Linking.openURL('tel:+919511117684');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.title}>Contact Us</Text>
                    <Text style={styles.subtitle}>Let's Start a Conversation</Text>
                    <Text style={styles.description}>Reach out to us today and experience the difference!</Text>
                </Animated.View>

                <Animated.View style={[styles.mainContactSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.contactItem}>
                        <Ionicons name="call" size={24} color="#0A3C97" />
                        <TouchableOpacity onPress={handlePhonePress}>
                            <Text style={styles.contactText}>+91 9511117684</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.contactItem}>
                        <Ionicons name="mail" size={24} color="#0A3C97" />
                        <TouchableOpacity onPress={handleEmailPress}>
                            <Text style={styles.contactText}>shweta@dataman.in</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <View style={styles.officesSection}>
                    {officeLocations.map((office, index) => (
                        <Animated.View 
                            key={index}
                            style={[styles.officeCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
                        >
                            <View style={styles.officeHeader}>
                                <Ionicons name={office.icon} size={24} color="#0A3C97" />
                                <Text style={styles.officeTitle}>{office.title}</Text>
                            </View>
                            <Text style={styles.officeAddress}>{office.address}</Text>
                        </Animated.View>
                    ))}
                </View>

                <Animated.View style={[styles.taglineSection, { opacity: fadeAnim }]}>
                    <Text style={styles.tagline}>Empowering innovation, driving success: Your trusted software partner.</Text>
                </Animated.View>

                {/* <View style={styles.quickLinksSection}>
                    <Text style={styles.quickLinksTitle}>Quick Links</Text>
                    <View style={styles.quickLinksGrid}>
                        {quickLinks.map((link, index) => (
                            <TouchableOpacity key={index} style={styles.quickLinkItem}>
                                <Text style={styles.quickLinkText}>{link}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View> */}

                <View style={styles.footer}>
                    <Text style={styles.copyright}>© 2025-26 – Dataman Computer Systems Pvt Ltd. All Rights Reserved.</Text>
                    {/* <View style={styles.footerLinks}>
                        <TouchableOpacity>
                            <Text style={styles.footerLink}>Terms & Conditions</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={styles.footerLink}>Privacy Policy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <Text style={styles.footerLink}>Refund Policy</Text>
                        </TouchableOpacity>
                    </View> */}
                </View>
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
        backgroundColor: '#0A3C97',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 8,
    },
    description: {
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 8,
    },
    mainContactSection: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 20,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
    },
    contactText: {
        fontSize: 18,
        color: '#0A3C97',
        marginLeft: 12,
        textDecorationLine: 'underline',
    },
    officesSection: {
        padding: 16,
    },
    officeCard: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    officeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    officeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0A3C97',
        marginLeft: 8,
    },
    officeAddress: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginLeft: 32,
    },
    taglineSection: {
        padding: 20,
        backgroundColor: '#F3F4F6',
    },
    tagline: {
        fontSize: 16,
        color: '#0A3C97',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    quickLinksSection: {
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    quickLinksTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0A3C97',
        marginBottom: 16,
        textAlign: 'center',
    },
    quickLinksGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    quickLinkItem: {
        padding: 8,
        margin: 4,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        minWidth: '45%',
    },
    quickLinkText: {
        fontSize: 14,
        color: '#374151',
        textAlign: 'center',
    },
    footer: {
        padding: 20,
        backgroundColor: '#0A3C97',
    },
    copyright: {
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    footerLinks: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    footerLink: {
        color: '#FFFFFF',
        marginHorizontal: 8,
        textDecorationLine: 'underline',
    },
});

export default ContactUsScreen;
