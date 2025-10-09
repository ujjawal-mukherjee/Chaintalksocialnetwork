import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Switch,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../Context/ThemeContext';
import { chatAppContext } from '../Context/ChatAppContext';

const SettingsScreen = () => {
  const { colors, toggleTheme } = useTheme();
  const { account } = useContext(chatAppContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    soundEffects: true,
    vibration: true,
    readReceipts: true,
    typingIndicator: true,
    messageBackup: true,
    autoDelete: false,
    language: 'English',
    fontSize: 'Medium',
  });

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

  const renderSettingItem = (icon, title, description, type = 'toggle', value, onValueChange) => (
    <Animated.View
      style={[
        styles.settingItem,
        {
          backgroundColor: colors.surface,
          opacity: fadeAnim,
          transform: [{ translateY }],
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `rgba(${parseInt(colors.primary.slice(1,3), 16)}, ${parseInt(colors.primary.slice(3,5), 16)}, ${parseInt(colors.primary.slice(5,7), 16)}, 0.15)` }]}>
        <MaterialIcons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.textSecondary, true: colors.primary }}
          thumbColor={Platform.OS === 'android' ? (value ? colors.primary : colors.textSecondary) : ''}
          ios_backgroundColor={colors.textSecondary + '40'}
        />
      ) : (
        <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
      )}
    </Animated.View>
  );

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Customize your experience
        </Text>
      </Animated.View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        {renderSettingItem(
          'brightness-6',
          'Dark Mode',
          'Switch between light and dark theme',
          'toggle',
          settings.darkMode,
          (value) => {
            setSettings({ ...settings, darkMode: value });
            toggleTheme();
          }
        )}
        {renderSettingItem(
          'format-size',
          'Font Size',
          'Adjust the text size',
          'select',
          settings.fontSize
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
        {renderSettingItem(
          'notifications',
          'Push Notifications',
          'Receive notifications for new messages',
          'toggle',
          settings.notifications,
          (value) => setSettings({ ...settings, notifications: value })
        )}
        {renderSettingItem(
          'volume-up',
          'Sound Effects',
          'Play sounds for messages and actions',
          'toggle',
          settings.soundEffects,
          (value) => setSettings({ ...settings, soundEffects: value })
        )}
        {renderSettingItem(
          'vibration',
          'Vibration',
          'Vibrate on new messages',
          'toggle',
          settings.vibration,
          (value) => setSettings({ ...settings, vibration: value })
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy</Text>
        {renderSettingItem(
          'done-all',
          'Read Receipts',
          'Show when messages are read',
          'toggle',
          settings.readReceipts,
          (value) => setSettings({ ...settings, readReceipts: value })
        )}
        {renderSettingItem(
          'edit',
          'Typing Indicator',
          'Show when others are typing',
          'toggle',
          settings.typingIndicator,
          (value) => setSettings({ ...settings, typingIndicator: value })
        )}
        {renderSettingItem(
          'backup',
          'Message Backup',
          'Automatically backup your messages',
          'toggle',
          settings.messageBackup,
          (value) => setSettings({ ...settings, messageBackup: value })
        )}
        {renderSettingItem(
          'delete',
          'Auto Delete',
          'Delete messages after 30 days',
          'toggle',
          settings.autoDelete,
          (value) => setSettings({ ...settings, autoDelete: value })
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Language</Text>
        {renderSettingItem(
          'language',
          'App Language',
          'Change the app language',
          'select',
          settings.language
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        {renderSettingItem(
          'info',
          'Version',
          '1.0.0',
          'info'
        )}
        {renderSettingItem(
          'description',
          'Terms of Service',
          'Read our terms and conditions',
          'link'
        )}
        {renderSettingItem(
          'privacy-tip',
          'Privacy Policy',
          'Learn about our privacy practices',
          'link'
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
  },
});

export default SettingsScreen; 