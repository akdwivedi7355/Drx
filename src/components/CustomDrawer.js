/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
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
  background: '#F1F5F9',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  error: '#DC2626',
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
        <View style={styles.headerSection}>
          <LinearGradient
            colors={['#0A3C97', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.headerGradient, { borderRadius : 12, height: 180 }]}
          />
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                  <Ionicons name="person" size={32} color={THEME_COLORS.primary} />
                </View>
                {loading ? (
                  <ActivityIndicator size="small" color={THEME_COLORS.primary} />
                ) : (
                  <Text style={styles.userName}>
                    {userData?.userName || 'No Name'}
                  </Text>
                )}
              </View>
              <View style={styles.userDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={16} color={THEME_COLORS.textSecondary} />
                  <Text style={styles.userEmail}>
                    {userData?.userEmail || 'No Email'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="medical-outline" size={16} color={THEME_COLORS.textSecondary} />
                  <Text style={styles.consultantText}>
                    {userData?.userLinkedConsultantName || 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <DrawerItemList 
            {...props}
            activeTintColor={THEME_COLORS.primary}
            inactiveTintColor={THEME_COLORS.textSecondary}
            activeBackgroundColor={`${THEME_COLORS.primary}08`}
            itemStyle={styles.menuItem}
            labelStyle={styles.menuLabel}
          />
        </View>
      </DrawerContentScrollView>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.signOutButton}>
          <View style={styles.buttonContent}>
            <View style={styles.signOutIcon}>
              <Ionicons 
                name="log-out-outline" 
                size={20} 
                color={THEME_COLORS.error}
              />
            </View>
            <Text style={styles.signOutText}>
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
  headerSection: {
    height: 180,
    position: 'relative',
    // width: '100%',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  profileCard: {
    backgroundColor: THEME_COLORS.surface,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  profileHeader: {
    gap: 10,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${THEME_COLORS.primary}08`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${THEME_COLORS.primary}20`,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Roboto-Medium',
    color: THEME_COLORS.text,
  },
  userDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: THEME_COLORS.textSecondary,
  },
  consultantText: {
    fontSize: 14,
    fontFamily: 'Roboto-Regular',
    color: THEME_COLORS.textSecondary,
  },
  menuSection: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 12,
    // backgroundColor: THEME_COLORS.surface,
  },
  menuItem: {
    borderRadius: 8,
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
  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: `${THEME_COLORS.error}08`,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signOutIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${THEME_COLORS.error}12`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 15,
    fontFamily: 'Roboto-Medium',
    color: THEME_COLORS.error,
  },
});

export default CustomDrawer;
