import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import { requestOtp, userAuthentication, verifyOtp } from '../api/api';

const { width } = Dimensions.get('window');
const loginTypes = ['mobile', 'username', 'email'];

const AuthTabs = () => {
  const [loginType, setLoginType] = useState('username');
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!input || (useOtp && !password)) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (useOtp && !otpSent) {
      Alert.alert('Error', 'Please send OTP first.');
      return;
    }
    if (!useOtp && !password) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }
    if (useOtp && otpSent && !password) {
      Alert.alert('Error', 'Please enter the OTP.');
      return;
    }
    setLoading(true);
    let loginID = loginType === 'mobile' ? 2 : loginType === 'email' ? 1 : 0;
    try {
      if (useOtp && otpSent) {
        const res = await verifyOtp(loginID, input, password);
        if (res.status) {
          Alert.alert('Success', 'OTP verified successfully.');
          dispatch(loginSuccess(res.data));
        } else {
          Alert.alert('Error', res.errorMessage || 'Unknown error');
        }
      } else {
        const res = await userAuthentication(loginID, input, password);
        if (res.status) {
          dispatch(loginSuccess(res.data));
        } else {
          Alert.alert('Login failed', res.errorMessage || 'Unknown error');
        }
      }
    } catch (err) {
      Alert.alert('Login error', err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpsent = async () => {
    if (!input) {
      Alert.alert('Error', 'Please enter your mobile number or email or username.');
      return;
    }
    let authtype = loginType === 'mobile' ? 2 : loginType === 'email' ? 1 : 0;
    const res = await requestOtp(authtype, input);
    if (res.status) {
      Alert.alert('OTP Sent', 'An OTP has been sent to your registered mobile number.');
      setOtpSent(true);
    } else {
      Alert.alert('Error', res.errorMessage || 'Unknown error');
    }
  };

  const getKeyboardType = (): KeyboardTypeOptions => {
    return loginType === 'mobile'
      ? 'phone-pad'
      : loginType === 'email'
      ? 'email-address'
      : 'default';
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.containerBox}>
        <Text style={styles.header}>Welcome Back 👨‍⚕️</Text>
        <Text style={styles.subHeader}>Login Portal</Text>

        <View style={styles.tabContainer}>
          {loginTypes.map(type => (
            <TouchableOpacity
              key={type}
              onPress={() => {
                setLoginType(type);
                setInput('');
                setPassword('');
                setOtpSent(false);
              }}
              style={[
                styles.tabButton,
                loginType === type && styles.tabButtonActive,
              ]}>
              <Text style={loginType === type ? styles.tabTextActive : styles.tabText}>
                {type.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          placeholder={`Enter your ${loginType}`}
          value={input}
          onChangeText={setInput}
          keyboardType={getKeyboardType()}
          style={styles.input}
        />

        {useOtp ? (
          otpSent ? (
            <TextInput
              placeholder="Enter OTP"
              value={password}
              onChangeText={setPassword}
              keyboardType="number-pad"
              secureTextEntry
              style={styles.input}
            />
          ) : (
            <TouchableOpacity style={styles.otpButton} onPress={handleOtpsent}>
              <Text style={styles.otpButtonText}>Send OTP</Text>
            </TouchableOpacity>
          )
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
            disabled={loading}>
            <Text style={styles.loginButtonText}>
              {loading ? (useOtp ? 'Verifying OTP...' : 'Logging in...') : (useOtp ? 'Verify OTP' : 'Login')}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            setUseOtp(prev => !prev);
            setOtpSent(false);
            setPassword('');
          }}
          style={styles.switchMode}>
          <Text style={styles.switchModeText}>
            {useOtp ? 'Use Password Instead' : 'Use OTP Instead'}
          </Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerPrompt}>New here?</Text>
          <TouchableOpacity>
            <Text style={styles.registerText}> Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default AuthTabs;


const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#E8ECF4', // light background
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
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 7,
    borderWidth: 1,
    borderColor: '#264487',
    marginHorizontal: 5,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  tabButtonActive: {
    backgroundColor: '#335589',
    borderColor: '#335589',
  },
  tabText: {
    color: '#0A3C97',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
    justifyContent: 'center',
    marginTop: 14,
  },
  registerPrompt: {
    color: '#335589',
  },
  registerText: {
    color: '#0A3C97',
    fontWeight: '600',
  },
});

