/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { logout } from '../redux/authSlice';
import { clearAsyncStorage, getUserDefaultDetails } from '../api/api';

const { width } = Dimensions.get('window');

const THEME_COLORS = {
  primary: '#2563EB',
  secondary: '#3B82F6',
  accent: '#60A5FA',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  error: '#EF4444',
};

const CustomDrawer = props => {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out',
          onPress: () => {
            clearAsyncStorage();
            dispatch(logout());
          },
          style: 'destructive'
        }
      ]
    );
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
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerContent}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          // colors={[THEME_COLORS.primary, THEME_COLORS.secondary]}
         colors={['#2563EB', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageWrapper}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={require('../assets/images/user-profile.jpg')}
                  style={styles.profileImage}
                />
              </View>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {userData?.userName || 'No Name'}
                </Text>
                <Text style={styles.userEmail}>
                  {userData?.userEmail || 'No Email'}
                </Text>
                <View style={styles.consultantBadge}>
                  <Ionicons name="medical" size={14} color="#fff" />
                  <Text style={styles.consultantText}>
                    {userData?.userLinkedConsultantName || 'N/A'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
        

        <View style={styles.menuContainer}>
          <DrawerItemList 
            {...props}
            activeTintColor={THEME_COLORS.primary}
            inactiveTintColor={THEME_COLORS.textSecondary}
            activeBackgroundColor={`${THEME_COLORS.primary}15`}
            itemStyle={styles.menuItem}
            labelStyle={styles.menuLabel}
          />
        </View>
      </DrawerContentScrollView>

      <View style={styles.bottomSection}>
       
        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.bottomButton, styles.signOutButton, { marginLeft: 10 }]}>
          <View style={styles.buttonContent}>
            <View style={[styles.iconContainer, styles.signOutIcon]}>
              <Ionicons 
                name="exit-outline" 
                size={20} 
                color={THEME_COLORS.error}
              />
            </View>
            <Text style={[styles.bottomButtonText, styles.signOutText]}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME_COLORS.background,
  },
  drawerContent: {
    padding: 0,
  },
  profileSection: {
    paddingTop: 10,
    paddingBottom: 10,
    // borderBottomRightRadius: 24,
    borderRadius: 24,
  },
  profileHeader: {
    paddingHorizontal: 16,
  },
  profileImageWrapper: {
    alignItems: 'center',
    // marginBottom: 16,
  },
  profileImageContainer: {
    padding: 3,
    borderRadius: 50,
    backgroundColor: 'rgba(228, 15, 15, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Roboto-Medium',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    marginBottom: 12,
  },
  consultantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  consultantText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'Roboto-Regular',
    marginLeft: 6,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 8,
    // backgroundColor: THEME_COLORS.surface,
  },
  menuItem: {
    borderRadius: 12,
    marginVertical: 2,
    paddingVertical: 4,
  },
  menuLabel: {
    fontFamily: 'Roboto-Medium',
    fontSize: 15,
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.border,
    backgroundColor: THEME_COLORS.surface,
  },
  bottomButton: {
    paddingVertical: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${THEME_COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  signOutIcon: {
    backgroundColor: `${THEME_COLORS.error}15`,
  },
  bottomButtonText: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: THEME_COLORS.text,
  },
  signOutButton: {
    marginTop: 8,
  },
  signOutText: {
    color: THEME_COLORS.error,
  },
});

export default CustomDrawer;
