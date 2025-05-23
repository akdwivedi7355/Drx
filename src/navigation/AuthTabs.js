import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';
import { requestOtp, userAuthentication } from '../api/api';

const loginTypes = ['mobile', 'username', 'email'];

const AuthTabs = () => {
  const [loginType, setLoginType] = useState('username');
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const handleLogin = () => {
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
    let loginID = loginType === 'mobile' ? 2 : loginType === 'email' ? 1 : 0;

    userAuthentication(loginID, input, password)
      .then(res => {
        if (res.status) {
          dispatch(loginSuccess(res.data));
        } else {
          Alert.alert('Login failed', res.errorMessage || 'Unknown error');
        }
      })
      .catch(err => {
        Alert.alert('Login error', err.message || 'Unknown error');
      });
  };

  const handleOtpsent = () => {   
    if (!input) {
      Alert.alert('Error', 'Please enter your mobile number or email or username.');
      return;
    }
    let authtype = loginType === 'mobile' ? 2 : loginType === 'email' ? 1 : 0;
    const res = requestOtp(authtype, input);
    if (res.status) {
      Alert.alert('OTP Sent', 'An OTP has been sent to your registered mobile number.');

    setOtpSent(true);
    }
    if (res.status === false) {
      Alert.alert('Error', res.errorMessage || 'Unknown error');
      return;
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
    <View style={styles.container}>
      <Text style={styles.header}>Welcome Back 👨‍⚕️</Text>
      <Text style={styles.subHeader}>Login Porttal</Text>

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
          <TouchableOpacity
            style={styles.otpButton}
            onPress={handleOtpsent}>
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

      { !useOtp &&   (<TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>)}

      {useOtp && otpSent && (   
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Verify OTP</Text>
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
  );
};

export default AuthTabs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    paddingHorizontal: 25,
    paddingTop: 180,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#344955',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 14,
    color: '#607D8B',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'center',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  tabButtonActive: {
    backgroundColor: '#4DB6AC',
    borderColor: '#4DB6AC',
  },
  tabText: {
    color: '#344955',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  otpButton: {
    backgroundColor: '#4DB6AC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  otpButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#00796B',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  switchMode: {
    alignItems: 'center',
    marginVertical: 6,
  },
  switchModeText: {
    color: '#00796B',
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  registerPrompt: {
    color: '#555',
  },
  registerText: {
    color: '#00796B',
    fontWeight: '600',
  },
});
