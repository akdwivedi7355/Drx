/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import ForgetScreen from '../screens/ForgetScreen';

const AuthTabs = () => {
  const [showForget, setShowForget] = useState(false);

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
