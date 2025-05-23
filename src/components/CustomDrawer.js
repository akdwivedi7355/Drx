/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

import Ionicons from 'react-native-vector-icons/Ionicons';

import {useDispatch} from 'react-redux';
import {logout} from '../redux/authSlice';
import {getUserDefaultDetails} from '../api/api';

const CustomDrawer = props => {
  const dispatch = useDispatch();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = () => {
    dispatch(logout());
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await getUserDefaultDetails();
        if (response.status && response.data) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        <ImageBackground
          source={require('../assets/images/cstside.jpg')}
          style={{padding: 20,borderCurves: 20}}>
          <Image
            source={require('../assets/images/user-profile.jpg')}
            style={{height: 80, width: 80, borderRadius: 40, marginBottom: 10}}
          />
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 18,
                  fontFamily: 'Roboto-Medium',
                  marginBottom: 5,
                }}>
                {userData?.userName || 'No Name'}
              </Text>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: 'Roboto-Regular',
                }}>
                {userData?.userEmail || 'No Email'}
              </Text>
              <Text style={{marginBottom: 2}}>
                 Consultant: {userData.userLinkedConsultantName || 'N/A'}
              </Text>
            </>
          )}
        </ImageBackground>

        <View style={{flex: 1, backgroundColor: '#fff', paddingTop: 20}}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      <View style={{padding: 20, borderTopWidth: 1, borderTopColor: '#ccc'}}>
        <TouchableOpacity onPress={() => {Alert.alert('Friend Not Found');}} style={{paddingVertical: 15}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="share-social-outline" size={22} />
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Roboto-Medium',
                marginLeft: 5,
              }}>
              Tell a Friend
            </Text>
          </View>
        </TouchableOpacity>

                paddingBottom: 50,
                <TouchableOpacity onPress={handleSignOut} style={{paddingVertical: 15, paddingBottom: 50}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="exit-outline" size={22} />
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Roboto-Medium',
                marginLeft: 5,
               }}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomDrawer;
