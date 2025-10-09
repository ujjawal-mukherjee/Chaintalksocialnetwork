import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../Context/ThemeContext';

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'message',
      title: 'New Message',
      description: 'John sent you a message',
      time: '2m ago',
      read: false,
      avatar: 'https://via.placeholder.com/40',
    },
    {
      id: 2,
      type: 'friend',
      title: 'Friend Request',
      description: 'Sarah wants to connect with you',
      time: '15m ago',
      read: false,
      avatar: 'https://via.placeholder.com/40',
    },
    {
      id: 3,
      type: 'reward',
      title: 'Reward Earned',
      description: 'You earned 50 tokens for being active',
      time: '1h ago',
      read: true,
      avatar: 'https://via.placeholder.com/40',
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update',
      description: 'New features are available',
      time: '2h ago',
      read: true,
      avatar: 'https://via.placeholder.com/40',
    },
  ]);

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return 'chat';
      case 'friend':
        return 'person-add';
      case 'reward':
        return 'stars';
      case 'system':
        return 'info';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return colors.primary;
      case 'friend':
        return colors.secondary;
      case 'reward':
        return colors.primary;
      case 'system':
        return colors.textSecondary;
      default:
        return colors.primary;
    }
  };

  const renderNotification = (notification, index) => {
    const iconColor = getNotificationColor(notification.type);
    
    return (
      <Animated.View
        key={notification.id}
        style={[
          styles.notificationItem,
          {
            backgroundColor: colors.surface,
            opacity: fadeAnim,
            transform: [{ translateY }],
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: `rgba(${parseInt(iconColor.slice(1,3), 16)}, ${parseInt(iconColor.slice(3,5), 16)}, ${parseInt(iconColor.slice(5,7), 16)}, 0.15)` }]}>
          <MaterialIcons name={getNotificationIcon(notification.type)} size={24} color={iconColor} />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationTitle, { color: colors.text }]}>
              {notification.title}
            </Text>
            <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>
              {notification.time}
            </Text>
          </View>
          <Text style={[styles.notificationDescription, { color: colors.textSecondary }]}>
            {notification.description}
          </Text>
        </View>
        {!notification.read && (
          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: `rgba(${parseInt(colors.primary.slice(1,3), 16)}, ${parseInt(colors.primary.slice(3,5), 16)}, ${parseInt(colors.primary.slice(5,7), 16)}, 0.15)` }]}
          onPress={() => setNotifications([])}
        >
          <MaterialIcons name="clear-all" size={20} color={colors.primary} />
          <Text style={[styles.clearButtonText, { color: colors.primary }]}>Clear All</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationsListContent}
      >
        {notifications.map((notification, index) => renderNotification(notification, index))}
      </ScrollView>

      {notifications.length === 0 && (
        <Animated.View
          style={[
            styles.emptyState,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <MaterialIcons name="notifications-off" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            No notifications yet
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    gap: 4,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  notificationsListContent: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
  },
  notificationDescription: {
    fontSize: 13,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    margin: 16,
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
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default NotificationsScreen; 