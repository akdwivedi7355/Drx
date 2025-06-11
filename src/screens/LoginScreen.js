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
    Dimensions,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import { requestOtp, userAuthentication, verifyOtp } from '../api/api';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LoginScreen = ({ onForgotPress }) => {
    const [useOtp, setUseOtp] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [input, setInput] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];
    const dispatch = useDispatch();

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

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
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Animated.View style={[styles.containerBox, { opacity: fadeAnim }]}>
                    <LinearGradient
                        colors={['#1a237e', '#0A3C97', '#1565c0']}
                        style={styles.headerGradient}>
                        <Icon name="doctor" size={50} color="#fff" />
                        <Text style={styles.header}>Welcome Back</Text>
                        <Text style={styles.subHeader}>Login to Your Account</Text>
                    </LinearGradient>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Icon name="account" size={24} color="#0A3C97" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Username, Email, or Mobile"
                                placeholderTextColor="#666"
                                value={input}
                                onChangeText={setInput}
                                style={[styles.input, otpSent && styles.disabledInput]}
                                editable={!otpSent}
                            />
                        </View>

                        {useOtp ? (
                            <>
                                {otpSent && (
                                    <View style={styles.inputContainer}>
                                        <Icon name="lock-outline" size={24} color="#0A3C97" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Enter OTP"
                                            value={password}
                                            onChangeText={setPassword}
                                            keyboardType="number-pad"
                                            secureTextEntry
                                            style={styles.input}
                                            placeholderTextColor="#666"
                                        />
                                    </View>
                                )}
                                {!otpSent ? (
                                    <TouchableOpacity 
                                        style={styles.gradientButton} 
                                        onPress={handleSendOtp}>
                                        <LinearGradient
                                            colors={['#1a237e', '#0A3C97']}
                                            style={styles.gradient}>
                                            <Text style={styles.buttonText}>Send OTP</Text>
                                        </LinearGradient>
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
                            <View style={styles.inputContainer}>
                                <Icon name="lock-outline" size={24} color="#0A3C97" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
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
                        )}

                        {(useOtp ? otpSent : true) && (
                            <TouchableOpacity
                                style={[styles.gradientButton, loading && { opacity: 0.6 }]}
                                onPress={handleLogin}
                                disabled={loading}>
                                <LinearGradient
                                    colors={['#1a237e', '#0A3C97']}
                                    style={styles.gradient}>
                                    <Text style={styles.buttonText}>
                                        {loading
                                            ? useOtp
                                                ? 'Verifying OTP...'
                                                : 'Logging in...'
                                            : useOtp
                                                ? 'Verify OTP'
                                                : 'Login'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => {
                                setUseOtp(prev => !prev);
                                setOtpSent(false);
                                setTimer(0);
                                setPassword('');
                            }}
                            style={styles.switchMode}>
                            <Text style={styles.switchModeText}>
                                {useOtp ? 'Use Password Instead' : 'Use OTP Instead'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.registerContainer}>
                            <TouchableOpacity onPress={onForgotPress}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.registerButton}
                                onPress={() => Alert.alert('Register', 'Registration feature coming soon!')}>
                                <Text style={styles.registerPrompt}>New here?</Text>
                                <Text style={styles.registerText}> Register</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

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
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    forgotText: {
        color: '#0A3C97',
        fontWeight: '600',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    registerButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    registerPrompt: {
        color: '#666',
        fontSize: 14,
    },
    registerText: {
        color: '#0A3C97',
        fontWeight: '600',
        fontSize: 14,
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


