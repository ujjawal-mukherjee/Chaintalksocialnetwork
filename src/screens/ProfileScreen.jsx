import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from '../Context/ThemeContext';
import { chatAppContext } from '../Context/ChatAppContext';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { account, username, userList, myRewardTokens } = useContext(chatAppContext);
  const [userImageUrl, setUserImageUrl] = useState('https://via.placeholder.com/100');
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchUserImage = async () => {
      try {
        const user = userList?.find(
          (u) => u.accountAddress.toLowerCase() === account?.toLowerCase()
        );
        if (user?.imageHash) {
          const res = await fetch(`https://ipfs.io/ipfs/${user.imageHash}`);
          if (!res.ok) {
            throw new Error('Failed to fetch image data');
          }
          const data = await res.json();
          setUserImageUrl(data.image || 'https://via.placeholder.com/100');
        }
      } catch (error) {
        console.error('Error fetching user image:', error);
        setUserImageUrl('https://via.placeholder.com/100');
      } finally {
        setLoading(false);
      }
    };

    if (userList?.length > 0 && account) {
      fetchUserImage();
    }
  }, [userList, account]);

  const renderStatItem = (icon, value, label) => (
    <Animated.View
      style={[
        styles.statItem,
        {
          backgroundColor: colors.surface,
          opacity: fadeAnim,
          transform: [{ translateY }],
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
    >
      <MaterialIcons name={icon} size={24} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </Animated.View>
  );

  const renderMenuItem = (icon, title, screenName) => (
    <TouchableOpacity
      style={[
        styles.menuItem,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
      onPress={() => navigation.navigate(screenName)}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.15)` }]}>
        <MaterialIcons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.menuText, { color: colors.text }]}>{title}</Text>
      <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            opacity: fadeAnim,
            transform: [{ translateY }],
            borderColor: colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: userImageUrl }}
            style={[styles.profileImage, { borderColor: colors.primary }]}
          />
          <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="edit" size={20} color={colors.buttonText} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.username, { color: colors.text }]}>{username}</Text>
        <Text style={[styles.address, { color: colors.textSecondary }]}>
          {account?.slice(0, 6)}...{account?.slice(-4)}
        </Text>
      </Animated.View>

      <View style={styles.statsContainer}>
        {renderStatItem('chat')}
        {renderStatItem('people')}
        {renderStatItem('stars')}
      </View>

      <View style={styles.menuSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        {renderMenuItem('notifications', 'Notifications', 'Notifications')}
        {renderMenuItem('stars', 'Achievements', 'Achievements')}
        {renderMenuItem('card-giftcard', 'Rewards', 'Rewards')}
        {renderMenuItem('settings', 'Settings', 'Settings')}
      </View>

      <Animated.View
        style={[
          styles.section,
          {
            backgroundColor: colors.surface,
            opacity: fadeAnim,
            transform: [{ translateY }],
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="help" size={24} color={colors.textSecondary} />
          <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="privacy-tip" size={24} color={colors.textSecondary} />
          <Text style={[styles.settingText, { color: colors.text }]}>Privacy Policy</Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <MaterialIcons name="description" size={24} color={colors.textSecondary} />
          <Text style={[styles.settingText, { color: colors.text }]}>Terms of Service</Text>
          <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={[
          styles.logoutButton,
          {
            backgroundColor: colors.error,
            borderColor: colors.error,
            borderWidth: 1,
          }
        ]}
        onPress={() => {/* Handle logout */ }}
      >
        <MaterialIcons name="logout" size={24} color={colors.buttonText} />
        <Text style={[styles.logoutText, { color: colors.buttonText }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  menuSection: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen; 