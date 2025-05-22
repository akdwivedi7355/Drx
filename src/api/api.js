import axios from 'axios';
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BaseURL = 'http://localhost/aarogyaRx_v5/aarogyaRx/apis/v1';
const AES_KEY = CryptoJS.enc.Hex.parse('1c012b9c8aa74363aa541b8080e886e0');
const AES_IV = CryptoJS.enc.Hex.parse('080aae32c79b49bf');

// AES Encryption
const encrypt = text => {
  const encrypted = CryptoJS.AES.encrypt(text, AES_KEY, {
    iv: AES_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
};

// POST Request
const post = async (url, data, headers = {}) => {
  try {
    const response = await axios.post(`${BaseURL}${url}`, data, {headers});
    return response.data;
  } catch (error) {
    console.error(`API error at ${url}:`, error.message);
    return {status: false, errorMessage: error.message};
  }
};

// Store to AsyncStorage
const storeToAsyncStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('AsyncStorage Save Error:', e);
  }
};

// Get from AsyncStorage
const getFromAsyncStorage = async key => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error('AsyncStorage Load Error:', e);
    return null;
  }
};

// (1) UserAuthentication with Password
export const userAuthentication = async (authType, loginId, password) => {
  const payload = {
    authType: authType.toString(),
    loginId: encrypt(loginId),
    password: encrypt(password),
  };
  const res = await post('/UserAuthentication', payload);
  if (res.status && res.data) {
    await storeToAsyncStorage('auth_credentials', {
      loginId: res.data.loginId,
      password: res.data.password,
      u: res.data.u,
    });
  }
  return res;
};

// (2) Request OTP
export const requestOtp = async (authType, loginId) => {
  const payload = {
    authType: authType,
    loginId: encrypt(loginId),
  };
  return await post('/RequestOTP', payload);
};

// (3) Verify OTP
export const verifyOtp = async (authType, loginId, otpValue) => {
  const payload = {
    authType: authType,
    loginId: encrypt(loginId),
    otpValue: encrypt(otpValue),
  };
  const res = await post('/VerifyOtp', payload);
  if (res.status && res.data) {
    await storeToAsyncStorage('auth_credentials', {
      loginId: res.data.loginId,
      password: res.data.password,
      u: res.data.u,
    });
  }
  return res;
};

// (4) User Authentication Auto
export const userAuthenticationAuto = async () => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) return {status: false, errorMessage: 'No stored credentials'};

  const payload = {
    loginId: creds.loginId,
    password: creds.password,
  };
  const res = await post('/UserAuthenticationAuto', payload);
  if (res.status && res.data) {
    await storeToAsyncStorage('auth_credentials', {
      loginId: res.data.loginId,
      password: res.data.password,
      u: res.data.u,
    });
  }
  return res;
};

// (5) User Default Detail
export const getUserDefaultDetails = async () => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) return {status: false, errorMessage: 'No session ID found'};

  const headers = {u: creds.u};
  const res = await post('/DefaultValues', {}, headers);
  if (res.status && res.data) {
    await storeToAsyncStorage('user_details', res.data);
  }
  return res;
};

// Helper to retrieve stored credentials
export const getStoredCredentials = async () => {
  return await getFromAsyncStorage('auth_credentials');
};

// Helper to retrieve stored user details
export const getStoredUserDetails = async () => {
  return await getFromAsyncStorage('user_details');
};
