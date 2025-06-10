/* eslint-disable no-unused-vars */
/* eslint-disable eol-last */

import axios from 'axios';
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BaseURL = 'http://192.168.7.79:8008/aarogyaRx_v5/aarogyaRx/apis/v1/';
const BaseURLLive = 'https://uataarogyarx.dmaarogya.com/aarogyarx/aarogyaRx/apis/v1/';


const AES_KEY = '1c012b9c8aa74363aa541b8080e886e0';
const AES_IV = '080aae32c79b49bf';


const encrypt = (plainText) => {
  var key = CryptoJS.enc.Utf8.parse(AES_KEY);
  var iv = CryptoJS.enc.Utf8.parse(AES_IV);

  var cipherText = CryptoJS.AES.encrypt(plainText, key, {
    iv: iv,
  });

  return cipherText.toString();
};

const decrypt = (cipherText) => {
  var key = CryptoJS.enc.Utf8.parse(AES_KEY);
  var iv = CryptoJS.enc.Utf8.parse(AES_IV);
  var decrypted = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Base64.parse(cipherText) }, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  if (decrypted.sigBytes <= 0) {
    console.error('Decryption failed: Invalid ciphertext or key/IV');
    return null;
  }

  return decrypted.toString(CryptoJS.enc.Utf8);
};

const post = async (url, data, headers = {}) => {
  try {
    const response = await axios.post(`${BaseURLLive}${url}`, data, { headers });
    if (response.data.respCode === 'ERR0001') {
      console.warn('Session invalid. Attempting automatic re-authentication...');
      const autoLoginRes = await userAuthenticationAuto();
      if (!autoLoginRes.status) {
        return { status: false, errorMessage: 'Auto login failed' };
      }
      const newCreds = await getFromAsyncStorage('auth_credentials');
      if (!newCreds) {
        return { status: false, errorMessage: 'Failed to retrieve new session ID after login' };
      }
      headers.u = newCreds.u;
      return await post(url, data, headers);
    }
    return response.data;
  } catch (error) {
    console.error(`API error at ${url}:`, error.message);
    return { status: false, errorMessage: error.message };
  }
};

const storeToAsyncStorage = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('AsyncStorage Save Error:', e);
  }
};

export const clearAsyncStorage = async () => {
  AsyncStorage.clear().then(() =>
    console.log('AsyncStorage cleared'),
  );
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
  const res = await post('/UserAuthentication', payload);
  if (res.status && res.data) {
    console.log(res);
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
  return await post('/RequestOTP', payload);
};

export const verifyOtp = async (authType, loginId, otpValue) => {
  const payload = {
    authType: authType,
    loginId: encrypt(loginId),
    otpValue: encrypt(otpValue),
  };
  const res = await post('/VerifyOTP', payload);
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
  if (!creds) { return { status: false, errorMessage: 'No stored credentials' }; }

  const payload = {
    loginId: creds.loginId,
    password: creds.password,
  };
  console.log('userAuthenticationAuto');
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
  if (!creds) { return { status: false, errorMessage: 'No session ID found' }; }

  const headers = { u: creds.u };
  let res = await post('/DefaultValues', {}, headers);

  if (res.respCode === 'ERR0001') {
    console.warn('Session invalid. Attempting automatic re-authentication...');
    const autoLoginRes = await userAuthenticationAuto();

    if (!autoLoginRes.status) {
      return { status: false, errorMessage: 'Auto login failed' };
    }

    const newCreds = await getFromAsyncStorage('auth_credentials');
    if (!newCreds) { return { status: false, errorMessage: 'Failed to retrieve new session ID after login' }; }

    const newHeaders = { u: newCreds.u };
    res = await post('/DefaultValues', {}, newHeaders);
  }
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

export const initiateAbhaVerification = async (payload) => {
  // const payload = {
  //   abhaAddress,
  //   initMode: '0',
  // };
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) { return { status: false, errorMessage: 'No session found' }; }

  const headers = { u: creds.u };
  return await post('/InitiateAbhaVerify', payload, headers);
};

export const requestAbhaOtp = async (
  ia_Token,
  abhaTokenId,
  selectedMode,
  abhaAddress
) => {
  const payload = {
    ia_Token,
    abhaTokenId,
    selectedMode,
    initMode: '0',
    abhaAddress,
  };
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) { return { status: false, errorMessage: 'No stored credentials' }; }


  const headers = { u: creds.u };
  return await post('/VerbalRequestOTP', payload, headers);
};

export const confirmAbhaOtp = async (
  abhaTokenId,
  ia_Token,
  abhaAddress,
  abhaNumber,
  transactionId,
  authCode,
  selectedMode
) => {
  const payload = {
    abhaTokenId,
    ia_Token,
    abhaddress: abhaAddress,
    abhaNumber,
    transactionId,
    authCode,
    initMode: '0',
    selectedMode,
  };
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) { return { status: false, errorMessage: 'No stored credentials' }; }


  const headers = { u: creds.u };
  return await post('/VerbalConfirmOTP', payload, headers);
};

export const verifyAbdmStatus = async (type, value) => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) { return { status: false, errorMessage: 'No stored credentials' }; }


  const payload = {
    type: type.toString(),
    value: value,
  };

  const headers = { u: creds.u };
  return await post('AbhaVerifyStatus', payload, headers);
};

export const forgetPassword = async (otp, authType, loginId, newPassword) => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) { return { status: false, errorMessage: 'No stored credentials' }; }

  const payload = {
    otpValue: encrypt(otp),
    authType: authType.toString(),
    loginId: encrypt(loginId),
    newPassword: encrypt(newPassword),
  };
  const headers = { u: creds.u };
  return await post('/ForgotPassword', payload, headers);
};

export const getdefaultconsultant = async () => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) { return { status: false, errorMessage: 'No stored credentials' }; }


  const headers = { u: creds.u };
  const res = await post('/DefaultConsultants', {}, headers);
  if (res.status && res.data) {
    await storeToAsyncStorage('default_consultant', res.data);
  }
  return res;
};

export const getStoredDefaultConsultant = async () => {
  return await getFromAsyncStorage('default_consultant');
};

export const getAllDoctors = async () => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) { return { status: false, errorMessage: 'No stored credentials' }; }

  const headers = { u: creds.u };
  const res = await post('/AllDoctors', {}, headers);
  return res;
};

export const getpatientList = async (consultantCode, date, searchText = '', rowPerPage, rowStartFrom) => {
  const creds = await getFromAsyncStorage('auth_credentials');

  if (!consultantCode) {
    const defaultConsultant = await getFromAsyncStorage('default_consultant');
    if (!defaultConsultant) {
      getdefaultconsultant();
    }
    consultantCode = defaultConsultant ? defaultConsultant.consultantCode : '';
  }
  if (!creds) { return { status: false, errorMessage: 'No stored credentials' }; }



  if (!searchText) {
    searchText = '';
  }
  const payload = {
    consultantCode: consultantCode,
    date: date || new Date().toISOString().split('T')[0],
    searchText: searchText,
    rowPerPage: rowPerPage || '10',
    rowStartFrom: rowStartFrom || '0',
  };
  const headers = { u: creds.u };
  const res = await post('/DashboardPatients', payload, headers);
  if (res.status && res.data) {
    await storeToAsyncStorage('patient_list', res.data);
  }
  return res;
};

export const getPatientDetails = async (patientId) => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) { return { status: false, errorMessage: 'No stored credentials' }; }

  const payload = { patientId };
  const headers = { u: creds.u };
  return await post('/PatientDetails', payload, headers);
};

export const AddPatients = async (patientData) => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) { return { status: false, errorMessage: 'No stored credentials' }; }

  const payload = {
    consultantCode: patientData.consultantCode,
    patientPrefix: patientData.patientPrefix,
    patientFirstName: patientData.patientFirstName,
    patientMiddleName: patientData.patientMiddleName,
    patientLastName: patientData.patientLastName,
    patientName: patientData.patientName,
    genderCode: patientData.patientGender,
    patientDob: patientData.patientDob,
    guardianPrefix: patientData.guardianPrefix,
    guardianName: patientData.guardianName,
    guardianRelationship: patientData.guardianRelationship,
    patientMobile: patientData.patientMobile,
    patientEmail: patientData.patientEmail,
    address1: patientData.address1,
    address2: patientData.address2 || null,
    cityCode: patientData.cityCode,
    abhaNumber: patientData.abhaNumber,
    abhaAddress: patientData.abhaAddress,
    abhaMobile: patientData.abhaMobile,
    iAarogyaLinkedId: patientData.iAarogyaLinkedId || null,
  };
  const headers = { u: creds.u };
  return await post('/AddPatient', payload, headers);
};

export const getpatientprofiledetail = async (patientId) => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) {
    return { status: false, errorMessage: 'No stored credentials' };
  }
  const payload = {
    isUhid: false,
    id: patientId,
  };
  const headers = { u: creds.u };
  return await post('/PatientProfileDetail', payload, headers);
};

export const getpatientListwithoutdoctor = async (searchText, rowPerPage, rowStartFrom) => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) {
    return { status: false, errorMessage: 'No stored credentials' };
  }
  const payload = {
    searchText: searchText,
    rowPerPage: rowPerPage || '10',
    rowStartFrom: rowStartFrom || '0',
  };
  const headers = { u: creds.u };
  return await post('/PatientList', payload, headers);
};


export const SavePrescriptionReport = async (patientData) => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) {
    return { status: false, errorMessage: 'No stored credentials' };
  }

  const payload = {
    regDocid: patientData.regDocid,
    isDoc: patientData.isDoc,
    consultantCode: patientData.consultantCode,
    uhid: patientData.uhid,
    rawData: patientData.rawData,
  };
  const headers = { u: creds.u };
  return await post('/SavePrescription', payload, headers);
}

export const SaveDiagnosticReport = async (patientData) => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) {
    return { status: false, errorMessage: 'No stored credentials' };
  }

  const payload = {
    regDocid: patientData.regDocid,
    isDoc: patientData.isDoc,
    consultantCode: patientData.consultantCode,
    uhid: patientData.uhid,
    rawData: patientData.rawData,
  };
  const headers = { u: creds.u };
  return await post('/SavePrescription', payload, headers);
}

export const saveMedicalBillReort = async (patientData) => {
  const creds = await getFromAsyncStorage('auth_credentials');
  if (!creds) {
    return { status: false, errorMessage: 'No stored credentials' };
  }

  const payload = {
    regDocid: patientData.regDocid,
    isDoc: patientData.isDoc,
    consultantCode: patientData.consultantCode,
    uhid: patientData.uhid,
    rawData: patientData.rawData,
  };
  const headers = { u: creds.u };
  return await post('/SaveSaleBill', payload, headers);
}
