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
} from 'react-native';
import { forgetPassword, requestOtp } from '../api/api';

const ForgetScreen = ({ onForgotPress }) => {
    const [input, setInput] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [authtype, setAuthtype] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [inputDisabled, setInputDisabled] = useState(false);

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
        setOtpSent(false); // Close the forget screen after successful reset
        setInputDisabled(false);
        setTimer(0);
        onForgotPress(); // Call the callback to close the forget screen
        // Optionally, you can navigate back to the login screen or perform any other action
        // Uncomment if using navigation
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.header}>Forgot Password</Text>

                <TextInput
                    placeholder="Enter username, email or mobile"
                    value={input}
                    onChangeText={setInput}
                    style={[styles.input, inputDisabled && styles.disabledInput]}
                    editable={!inputDisabled}
                />

                {!otpSent ? (
                    <>
                        <TouchableOpacity style={styles.button} onPress={handleRequestOtp}>
                            <Text style={styles.buttonText}>Send OTP</Text>
                        </TouchableOpacity>
                        <View style={{ alignItems: 'flex-start', marginTop: 20 }}>
                            <TouchableOpacity onPress={onForgotPress}>
                                <Text style={{ color: '#0A3C97', fontWeight: "600", textDecorationLine: 'underline' }}>
                                    Go to login screen?
                                </Text>
                            </TouchableOpacity>
                        </View>

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

                        <TextInput
                            placeholder="Enter OTP"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="New Password"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Confirm Password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            style={styles.input}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                            <Text style={styles.buttonText}>Reset Password</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

export default ForgetScreen;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: '#E8ECF4',
        padding: 20,
    },
    container: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 15,
        elevation: 3,
    },
    header: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0A3C97',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#264487',
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
        color: '#0A3C97',
    },
    disabledInput: {
        backgroundColor: '#D3D3D3',
        color: '#7B7B7B',
    },
    button: {
        backgroundColor: '#0A3C97',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    timerText: {
        textAlign: 'center',
        color: '#335589',
        fontWeight: '600',
        marginBottom: 12,
    },
    resendText: {
        textAlign: 'center',
        color: '#0A3C97',
        fontWeight: '600',
        marginBottom: 12,
    },
});
