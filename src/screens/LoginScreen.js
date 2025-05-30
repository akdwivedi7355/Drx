/* eslint-disable react-native/no-inline-styles */
/* eslint-disable curly */
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import { requestOtp, userAuthentication, verifyOtp } from '../api/api';


const LoginScreen = ({ onForgotPress }) => {
    const [useOtp, setUseOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [input, setInput] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    // Countdown timer effect
    useEffect(() => {
        let interval;
        if (otpSent && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpSent, timer]);

    const detectLoginType = (text) => {
        if (/^\d{10}$/.test(text)) return 2; // mobile
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 1; // email
        return 0; // username
    };

    const handleLogin = async () => {
        if (!input || (useOtp && !password)) return Alert.alert('Error', 'Please fill in all fields.');
        if (useOtp && !otpSent) return Alert.alert('Error', 'Please send OTP first.');

        setLoading(true);
        const loginID = detectLoginType(input);

        try {
            const res = useOtp
                ? await verifyOtp(loginID, input, password)
                : await userAuthentication(loginID, input, password);

            if (res.status) {
                // Alert.alert('Success', useOtp ? 'OTP verified successfully.' : 'Login successful.');
                dispatch(loginSuccess(res.data));
            } else {
                Alert.alert('Error', res.errorMessage || 'Unknown error');
            }
        } catch (err) {
            Alert.alert('Login error', err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!input) return Alert.alert('Error', 'Please enter username, email, or mobile.');
        const loginID = detectLoginType(input);
        const res = await requestOtp(loginID, input);
        if (res.status) {
            Alert.alert('OTP Sent', 'OTP has been sent to your contact.');
            setOtpSent(true);
            setTimer(60); // Start 60s countdown
        } else {
            Alert.alert('Error', res.errorMessage || 'Unknown error');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.containerBox}>
                <Text style={styles.header}>Welcome Back 👨‍⚕️</Text>
                <Text style={styles.subHeader}>Login Portal</Text>

                <TextInput
                    placeholder="Enter your username, email, or mobile"
                    value={input}
                    onChangeText={setInput}
                    style={[styles.input, otpSent && styles.disabledInput]}
                    editable={!otpSent}
                />

                {useOtp ? (
                    <>
                        {otpSent && (
                            <TextInput
                                placeholder="Enter OTP"
                                value={password}
                                onChangeText={setPassword}
                                keyboardType="number-pad"
                                secureTextEntry
                                style={styles.input}
                            />
                        )}
                        {!otpSent ? (
                            <TouchableOpacity style={styles.otpButton} onPress={handleSendOtp}>
                                <Text style={styles.otpButtonText}>Send OTP</Text>
                            </TouchableOpacity>
                        ) : timer > 0 ? (
                            <Text style={styles.timerText}>Resend in {timer}s</Text>
                        ) : (
                            <TouchableOpacity onPress={handleSendOtp}>
                                <Text style={styles.resendText}>Resend OTP</Text>
                            </TouchableOpacity>
                        )}
                    </>
                ) : (
                    <TextInput
                        placeholder="Enter Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                    />
                )}

                {(useOtp ? otpSent : true) && (
                    <TouchableOpacity
                        style={[styles.loginButton, loading && { opacity: 0.6 }]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading
                                ? useOtp
                                    ? 'Verifying OTP...'
                                    : 'Logging in...'
                                : useOtp
                                    ? 'Verify OTP'
                                    : 'Login'}
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={() => {
                        setUseOtp(prev => !prev);
                        setOtpSent(false);
                        setTimer(0);
                        setPassword('');
                    }}
                    style={styles.switchMode}
                >
                    <Text style={styles.switchModeText}>
                        {useOtp ? 'Use Password Instead' : 'Use OTP Instead'}
                    </Text>
                </TouchableOpacity>




                <View style={styles.registerContainer}>
                    <TouchableOpacity onPress={onForgotPress}>
                        <Text style={{ color: '#0A3C97', fontWeight: '600', alignSelf: 'left', textDecorationLine: 'underline' }}>
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        onPress={() => Alert.alert('Register', 'Registration feature coming soon!')}
                    >
                        <Text style={styles.registerPrompt}>New here?</Text>
                        <Text style={styles.registerText}> Register</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </ScrollView>
    );
};

export default LoginScreen;



const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#E8ECF4',
    },
    containerBox: {
        backgroundColor: '#FFFFFF',
        padding: 25,
        borderRadius: 15,
        width: '100%',
        maxWidth: 450,
        alignSelf: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    header: {
        fontSize: 26,
        fontWeight: '700',
        color: '#0A3C97',
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 14,
        color: '#335589',
        textAlign: 'center',
        marginBottom: 20,
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
    otpButton: {
        backgroundColor: '#335589',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    otpButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    timerText: {
        textAlign: 'center',
        color: '#335589',
        fontWeight: '600',
        marginBottom: 12,
    },
    loginButton: {
        backgroundColor: '#0A3C97',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    switchMode: {
        alignItems: 'center',
        marginVertical: 6,
    },
    switchModeText: {
        color: '#264487',
        fontWeight: '500',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,

    },
    registerPrompt: {
        color: '#335589',
    },
    registerText: {
        color: '#0A3C97',
        fontWeight: '600',
    },
    resendText: {
        color: '#0A3C97',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
    },
    disabledInput: {
        backgroundColor: '#F0F0F0',
        color: '#999999',
        borderColor: '#CCCCCC',
    },

});


