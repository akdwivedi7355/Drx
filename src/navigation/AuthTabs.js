import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {loginSuccess} from '../redux/authSlice';
import SvgComponent from '../assets/img/Lgscren';

const AuthTabs = () => {
  const [loginType, setLoginType] = useState('mobile');
  const [useOtp, setUseOtp] = useState(false);
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [otpfield, setOtpfield] = useState(false);

  const dispatch = useDispatch();

  const handleLogin = () => {
    console.log(loginType, input, password, useOtp);
    const dummyUser = {
      id: Math.floor(Math.random() * 1000),
      name: `${loginType} User`,
      loginMethod: loginType,
      identifier: input,
      method: useOtp ? 'otp' : 'password',
    };
    dispatch(loginSuccess(dummyUser));
    console.log('Logged in user:', dummyUser);
  };

  const getKeyboardType = (): KeyboardTypeOptions => {
    if (loginType === 'mobile') return 'phone-pad';
    if (loginType === 'email') return 'email-address';
    return 'default';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>

      <View style={styles.loginTypeContainer}>
        {['mobile', 'username', 'email'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setLoginType(type)}
            style={[
              styles.loginTypeButton,
              loginType === type && styles.loginTypeSelected,
            ]}>
            <Text style={{color: loginType === type ? '#fff' : '#000'}}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
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
        !otpfield ? (
          <TouchableOpacity
            onPress={() => setOtpfield(true)}
            style={styles.otpButton}>
            <Text style={styles.otpButtonText}>Send OTP</Text>
          </TouchableOpacity>
        ) : (
          <TextInput
            placeholder="Enter OTP"
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (text.length > 0) setOtpfield(true); // Send OTP button remains hidden
            }}
            secureTextEntry
            style={styles.input}
          />
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

      <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>
          {useOtp ? 'Verify Otp' : 'Login'}
        </Text>
      </TouchableOpacity>

      <View style={styles.toggleOtpContainer}>
        <TouchableOpacity
          onPress={() => {
            setUseOtp(prev => !prev);
            setOtpfield(false);
            setPassword('');
          }}>
          <Text style={styles.toggleOtpText}>
            {useOtp ? 'Login with Password' : 'Login with OTP'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.registerContainer}>
        <Text>New to the app?</Text>
        <TouchableOpacity>
          <Text style={styles.registerText}> Register</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.svgContainer}>
        <SvgComponent height={280} width={280} />
      </View>
    </View>
  );
};

export default AuthTabs;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
  },
  header: {
    fontSize: 28,
    fontWeight: '500',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  loginTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loginTypeButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 6,
  },
  loginTypeSelected: {
    backgroundColor: '#AD40AF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  otpButton: {
    backgroundColor: '#AD40AF',
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
    backgroundColor: '#AD40AF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  toggleOtpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toggleOtpText: {
    color: '#000',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  registerText: {
    color: '#AD40AF',
    fontWeight: '700',
  },
  svgContainer: {
    alignItems: 'center',
  },
});
