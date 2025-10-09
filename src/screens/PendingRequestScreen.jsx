import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  FlatList,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { chatAppContext } from '../Context/ChatAppContext';
import { useTheme } from '../Context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MAX_WIDTH = 340;
const CARD_WIDTH = Math.min((SCREEN_WIDTH - 48) / 2, CARD_MAX_WIDTH); // 2 cards per row with padding, max 340px

const DefaultAvatar = ({ size = 40, color = '#888' }) => (
  <View style={{
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: color,
  }}>
    <MaterialIcons name="person" size={size * 0.6} color={color} />
  </View>
);

const PendingRequestCard = ({ user, imageUrl, index, acceptFriendRequest, rejectRequest, colors }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
        delay: index * 100,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: index * 100,
      }),
    ]).start();
  }, []);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await acceptFriendRequest(user.accountAddress);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await rejectRequest(user.accountAddress);
    } finally {
      setIsLoading(false);
    }
  };

  // Status indicator: online (green), offline (gray)
  const isOnline = true; // You can replace this with real status if available
  const statusColor = isOnline ? '#4ade80' : '#a1a1aa';

  return (
    <Animated.View
      style={[
        styles.requestCardContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          width: CARD_WIDTH,
          maxWidth: CARD_MAX_WIDTH,
          alignSelf: 'center',
        },
      ]}
    >
      <LinearGradient
        colors={[colors.surface, '#23272fBB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glassCardBgCompact}
      >
        <View style={styles.userInfoCompact}>
          <View style={styles.imageContainerCompact}>
            <LinearGradient
              colors={[colors.primary, '#4f8cff', '#23272f']}
              style={styles.avatarGradientCompact}
            >
              {imgError || !imageUrl ? (
                <DefaultAvatar size={40} color={colors.primary} />
              ) : (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.userImageCompact}
                  onError={() => setImgError(true)}
                />
              )}
            </LinearGradient>
            <View style={[styles.statusIndicatorCompact, { backgroundColor: statusColor, borderColor: colors.surface }]} />
          </View>
          <View style={styles.userDetailsCompact}>
            <Text style={[styles.userNameCompact, { color: colors.primary }]} numberOfLines={1}>{user?.name || 'Unknown'}</Text>
            <Text style={[styles.userAddressCompact, { color: colors.textSecondary }]} numberOfLines={1}>
              {user?.accountAddress.slice(0, 4)}...{user?.accountAddress.slice(-4)}
            </Text>
          </View>
        </View>
        <View style={styles.buttonContainerCompact}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.primary }]}
            onPress={handleAccept}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.buttonText} />
            ) : (
              <MaterialIcons name="check" size={20} color={colors.buttonText} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.error }]}
            onPress={handleReject}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.buttonText} />
            ) : (
              <MaterialIcons name="close" size={20} color={colors.buttonText} />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const PendingRequestScreen = () => {
  const { pendingRequests, acceptFriendRequest, rejectRequest, userList } = useContext(chatAppContext);
  const { colors } = useTheme();
  const [userImages, setUserImages] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getUserDetails = (address) => {
    return userList.find(
      (user) => user.accountAddress.toLowerCase() === address.toLowerCase()
    );
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      for (const address of pendingRequests) {
        const user = getUserDetails(address);

        if (user?.imageHash && !userImages[address]) {
          try {
            const url = `https://ipfs.io/ipfs/${user.imageHash}`;
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error('Failed to fetch image data');
            }
            const data = await response.json();
            setUserImages((prev) => ({
              ...prev,
              [address]: data.image || 'https://via.placeholder.com/100',
            }));
          } catch (error) {
            console.error(`Image fetch failed for ${address}:`, error);
            setUserImages((prev) => ({
              ...prev,
              [address]: 'https://via.placeholder.com/100',
            }));
          }
        }
      }
    };

    if (pendingRequests.length > 0) fetchImages();
  }, [pendingRequests, userList]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Add your refresh logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.mainContent}>
        <View style={[styles.headerSection, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <View style={[styles.headerGradient, { backgroundColor: `rgba(${parseInt(colors.primary.slice(1,3), 16)}, ${parseInt(colors.primary.slice(3,5), 16)}, ${parseInt(colors.primary.slice(5,7), 16)}, 0.2)` }]} />
          <MaterialIcons name="people" size={32} color={colors.primary} style={styles.headerIcon} />
          <Text style={[styles.heading, { color: colors.text }]}>
            Pending Requests
          </Text>
          <Text style={[styles.subHeading, { color: colors.textSecondary }]}>
            {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} waiting
          </Text>
        </View>

        {pendingRequests.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <MaterialIcons name="people-outline" size={48} color={colors.textSecondary} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No pending requests at the moment.
            </Text>
          </View>
        ) : (
          <FlatList
            data={pendingRequests}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              const user = getUserDetails(item);
              const imageUrl = userImages[item] || 'https://via.placeholder.com/100';
              
              return (
                <PendingRequestCard
                  user={user}
                  imageUrl={imageUrl}
                  index={index}
                  acceptFriendRequest={acceptFriendRequest}
                  rejectRequest={rejectRequest}
                  colors={colors}
                />
              );
            }}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  mainContent: {
    flex: 1,
  },
  headerSection: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    overflow: 'hidden',
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
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  headerIcon: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingVertical: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  requestCardContainer: {
    marginBottom: 16,
  },
  glassCardBgCompact: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(36, 40, 47, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 110,
    justifyContent: 'center',
  },
  userInfoCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  imageContainerCompact: {
    position: 'relative',
    marginRight: 8,
  },
  avatarGradientCompact: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  userImageCompact: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: '#181a20',
  },
  statusIndicatorCompact: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  userDetailsCompact: {
    flex: 1,
    justifyContent: 'center',
  },
  userNameCompact: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  userAddressCompact: {
    fontSize: 12,
    color: '#aaa',
  },
  buttonContainerCompact: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyContainer: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
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
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PendingRequestScreen;
