/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import ForgetScreen from '../screens/ForgetScreen';
import LoadingScreen from '../screens/LoadingScreen';
import { getUserDefaultDetails, userAuthenticationAuto } from '../api/api';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/authSlice';

const AuthTabs = () => {
  const [showForget, setShowForget] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // NEW STATE
  const dispatch = useDispatch();

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 4000)
        );

        const response = await Promise.race([
          userAuthenticationAuto(),
          timeoutPromise,
        ]);

        console.log(response);

        if (response?.status) {
          await getUserDefaultDetails();
          dispatch(loginSuccess(response.data));
          // Navigation to home/dashboard should happen here if needed
        } else {
          setIsLoading(false); // show login
        }
      } catch (error) {
        console.log('Auto-login error:', error.message || error);
        setIsLoading(false); // show login on failure or timeout
      }
    };

    authenticateUser();
  }, [dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      {showForget ? (
        <ForgetScreen onForgotPress={() => setShowForget(false)} />
      ) : (
        <LoginScreen onForgotPress={() => setShowForget(true)} />
      )}
    </View>
  );
};

export default AuthTabs;
