import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStoredUserDetails } from '../api/api';

const CustomStackHeader = ({ navigation, route, options, back }) => {
  const [siteName, setSiteName] = useState('');
  const insets = useSafeAreaInsets();
  const title = options.title || route.name;

  useEffect(() => {
    const fetchSiteName = async () => {
      try {
        const userDetails = await getStoredUserDetails();
        if (userDetails?.facilityName) {
          setSiteName(userDetails.facilityName);
        }
      } catch (err) {
        console.error('Failed to fetch user details:', err);
      }
    };

    fetchSiteName();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: 0 }]}>
      <View style={[styles.header, { marginTop: insets.top }]}>
        {back ? (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={navigation.goBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        ) : navigation.openDrawer ? (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={navigation.openDrawer}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="menu" size={22} color="#fff" />
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>

        <View style={styles.siteContainer}>
          <Ionicons name="business-outline" size={16} color="#fff" style={styles.icon} />
          <Text style={styles.siteName} numberOfLines={1}>
            {siteName}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A3C97',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#0A3C97',
  },
  menuButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 4,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  pageTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  siteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    maxWidth: '40%',
  },
  icon: {
    marginRight: 4,
  },
  siteName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default CustomStackHeader; 