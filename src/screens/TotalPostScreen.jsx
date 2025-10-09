import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../Context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const TotalPostScreen = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNavigation = (screen) => {
    navigation.navigate(screen, {
      showBackButton: true,
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY },
            { scale: scaleAnim },
          ],
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={[styles.headerSection, { backgroundColor: colors.surface }]}>
        <View style={[styles.headerGradient, { backgroundColor: colors.primary + '20' }]} />
        <Text style={[styles.heading, { color: colors.text }]}>
          Explore Posts
        </Text>
        <Text style={[styles.subHeading, { color: colors.textSecondary }]}>
          Discover and interact with posts from your network
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.surface }]}
          onPress={() => handleNavigation('AllPost')}
          activeOpacity={0.8}
        >
          <View style={[styles.buttonContent, { backgroundColor: colors.primary + '10' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialIcons name="article" size={20} color={colors.primary} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={[styles.buttonTitle, { color: colors.text }]}>Your Posts</Text>
              <Text style={[styles.buttonSubtitle, { color: colors.textSecondary }]}>
                View your posts
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.surface }]}
          onPress={() => handleNavigation('FriendPost')}
          activeOpacity={0.8}
        >
          <View style={[styles.buttonContent, { backgroundColor: colors.primary + '10' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialIcons name="group" size={20} color={colors.primary} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={[styles.buttonTitle, { color: colors.text }]}>Friend's Posts</Text>
              <Text style={[styles.buttonSubtitle, { color: colors.textSecondary }]}>
                See friend's posts
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.surface }]}
          onPress={() => handleNavigation('GeneratePost')}
          activeOpacity={0.8}
        >
          <View style={[styles.buttonContent, { backgroundColor: colors.secondary + '10' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
              <MaterialIcons name="auto-awesome" size={20} color={colors.secondary} />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={[styles.buttonTitle, { color: colors.text }]}>Generate Post</Text>
              <Text style={[styles.buttonSubtitle, { color: colors.textSecondary }]}>
                Create AI-powered posts
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerSection: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  buttonSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default TotalPostScreen;
