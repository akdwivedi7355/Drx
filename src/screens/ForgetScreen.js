/* eslint-disable quotes */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable curly */
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
} from 'react-native';
import { forgetPassword, requestOtp } from '../api/api';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ForgetScreen = ({ onForgotPress }) => {
    const [input, setInput] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [authtype, setAuthtype] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [inputDisabled, setInputDisabled] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else {
            setInputDisabled(false);
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const detectLoginType = (text) => {
        if (/^\d{10}$/.test(text)) return 2; // mobile
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 1; // email
        return 0; // username
    };

    const handleRequestOtp = async () => {
        if (!input) return Alert.alert('Error', 'Please enter your username/email/mobile.');

        const loginID = detectLoginType(input);
        setAuthtype(loginID);
        const res = await requestOtp(loginID, input);

        if (res.status) {
            Alert.alert('OTP Sent', 'Check your registered contact.');
            setOtpSent(true);
            setInputDisabled(true);
            setTimer(60);
        } else {
            Alert.alert('Error', res.errorMessage || 'Failed to send OTP.');
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword || !confirmPassword)
            return Alert.alert('Error', 'Please fill all the fields.');

        if (newPassword !== confirmPassword)
            return Alert.alert('Mismatch', 'Passwords do not match.');

        const res = await forgetPassword(otp, authtype, input, newPassword);

        if (!res.status) {
            return Alert.alert('Error', res.errorMessage || 'Failed to reset password.');
        }

        Alert.alert('Success', 'Password has been reset successfully.');
        setInput('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setOtpSent(false);
        setInputDisabled(false);
        setTimer(0);
        onForgotPress();
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Animated.View style={[styles.containerBox, { opacity: fadeAnim }]}>
                    <LinearGradient
                        colors={['#1a237e', '#0A3C97', '#1565c0']}
                        style={styles.headerGradient}>
                        <Icon name="lock-reset" size={50} color="#fff" />
                        <Text style={styles.header}>Reset Password</Text>
                        <Text style={styles.subHeader}>Recover your account access</Text>
                    </LinearGradient>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Icon name="account" size={24} color="#0A3C97" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Username, Email, or Mobile"
                                placeholderTextColor="#666"
                                value={input}
                                onChangeText={setInput}
                                style={[styles.input, inputDisabled && styles.disabledInput]}
                                editable={!inputDisabled}
                            />
                        </View>

                        {!otpSent ? (
                            <>
                                <TouchableOpacity
                                    style={styles.gradientButton}
                                    onPress={handleRequestOtp}>
                                    <LinearGradient
                                        colors={['#1a237e', '#0A3C97']}
                                        style={styles.gradient}>
                                        <Text style={styles.buttonText}>Send OTP</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.switchMode}
                                    onPress={onForgotPress}>
                                    <Text style={styles.switchModeText}>Back to Login</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                {timer > 0 ? (
                                    <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
                                ) : (
                                    <TouchableOpacity onPress={handleRequestOtp}>
                                        <Text style={styles.resendText}>Resend OTP</Text>
                                    </TouchableOpacity>
                                )}

                                <View style={styles.inputContainer}>
                                    <Icon name="key-variant" size={24} color="#0A3C97" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChangeText={setOtp}
                                        keyboardType="number-pad"
                                        style={styles.input}
                                        placeholderTextColor="#666"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Icon name="lock-outline" size={24} color="#0A3C97" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showPassword}
                                        style={styles.input}
                                        placeholderTextColor="#666"
                                    />
                                    <TouchableOpacity 
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeIcon}>
                                        <Icon 
                                            name={showPassword ? "eye-off" : "eye"} 
                                            size={24} 
                                            color="#0A3C97" 
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Icon name="lock-outline" size={24} color="#0A3C97" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry={!showConfirmPassword}
                                        style={styles.input}
                                        placeholderTextColor="#666"
                                    />
                                    <TouchableOpacity 
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={styles.eyeIcon}>
                                        <Icon 
                                            name={showConfirmPassword ? "eye-off" : "eye"} 
                                            size={24} 
                                            color="#0A3C97" 
                                        />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.gradientButton}
                                    onPress={handleResetPassword}>
                                    <LinearGradient
                                        colors={['#1a237e', '#0A3C97']}
                                        style={styles.gradient}>
                                        <Text style={styles.buttonText}>Reset Password</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f6fa',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    containerBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        maxWidth: 450,
        alignSelf: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 5 },
        overflow: 'hidden',
    },
    headerGradient: {
        padding: 30,
        alignItems: 'center',
    },
    formContainer: {
        padding: 25,
    },
    header: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 15,
    },
    subHeader: {
        fontSize: 16,
        color: '#E8ECF4',
        marginTop: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F6FA',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8ECF4',
    },
    inputIcon: {
        padding: 10,
        marginLeft: 5,
    },
    input: {
        flex: 1,
        padding: 15,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 10,
    },
    gradientButton: {
        borderRadius: 12,
        marginVertical: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    gradient: {
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    timerText: {
        textAlign: 'center',
        color: '#0A3C97',
        fontSize: 14,
        fontWeight: '600',
        marginVertical: 10,
    },
    switchMode: {
        alignItems: 'center',
        marginVertical: 15,
    },
    switchModeText: {
        color: '#0A3C97',
        fontSize: 14,
        fontWeight: '600',
    },
    resendText: {
        color: '#0A3C97',
        fontWeight: '600',
        textAlign: 'center',
        marginVertical: 10,
        fontSize: 14,
    },
    disabledInput: {
        backgroundColor: '#F0F0F0',
        color: '#999999',
    },
});

export default ForgetScreen;
