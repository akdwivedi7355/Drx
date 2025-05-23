import axios from 'axios';
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BaseURL = 'https://uataarogyarx.dmaarogya.com/aarogyarx/aarogyaRx/apis/v1/';
const AES_KEY = '1c012b9c8aa74363aa541b8080e886e0';
const AES_IV = '080aae32c79b49bf';

const encrypt = (plainText) => {
  var key = CryptoJS.enc.Utf8.parse(AES_KEY);
  var iv = CryptoJS.enc.Utf8.parse(AES_IV);

  console.log("IV (Base64):", CryptoJS.enc.Base64.stringify(iv));
  var cipherText = CryptoJS.AES.encrypt(plainText, key, {
    // eslint-disable-next-line comma-dangle
    iv: iv,
  });

  return cipherText.toString();
};

const decrypt = (cipherText) => { 
  var key = CryptoJS.enc.Utf8.parse(AES_KEY);
  var iv = CryptoJS.enc.Utf8.parse(AES_IV);
  var decrypted = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(cipherText) }, key, {
    iv: iv ,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  console.log("Decrypted:", decrypted);
  console.log(decrypted.toString(CryptoJS.enc.Utf8));
  if (decrypted.sigBytes <= 0) {
    console.error('Decryption failed: Invalid ciphertext or key/IV');
    return null;
  }

  return decrypted.toString(CryptoJS.enc.Utf8);
}
const post = async (url, data, headers = {}) => {
  try {
    const response = await axios.post(`${BaseURL}${url}`, data, {headers});
    console.log("Response:", response);
    return response.data;
  } catch (error) {
    console.error(`API error at ${url}:`, error.message);
    return {status: false, errorMessage: error.message};
  }
};


const storeToAsyncStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('AsyncStorage Save Error:', e);
  }
};

const getFromAsyncStorage = async key => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error('AsyncStorage Load Error:', e);
    return null;
  }
};


export const userAuthentication = async (authType, loginId, password) => {
  const payload = {
    authType: authType.toString(),
    loginId: encrypt(loginId),
    password: encrypt(password),
  };
  console.log("payload", payload);
  const res = await post('/UserAuthentication', payload);
  console.log("res", res);
  if (res.status && res.data) {
    await storeToAsyncStorage('auth_credentials', {
      loginId: res.data.loginId,
      password: res.data.password,
      u: res.data.u,
    });
  }
  return res;
};


export const requestOtp = async (authType, loginId) => {
  const payload = {
    authType: authType,
    loginId: encrypt(loginId),
  };
  console.log("payload", payload);
  const decript =  decrypt(payload.loginId);
  console.log("decript", decript);
  return await post('/RequestOTP', payload);
};


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

export const getStoredCredentials = async () => {
  return await getFromAsyncStorage('auth_credentials');
};


export const getStoredUserDetails = async () => {
  return await getFromAsyncStorage('user_details');
};
