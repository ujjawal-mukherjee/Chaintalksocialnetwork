import React, { useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { chatAppContext } from "../Context/ChatAppContext";
import { useTheme } from '../Context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

const NFTHomeScreen = () => {
  const { account, username, error } = useContext(chatAppContext);
  const { colors } = useTheme();
  const navigation = useNavigation();

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
    navigation.navigate(screen);
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
        <MaterialIcons name="auto-awesome" size={32} color={colors.primary} style={styles.headerIcon} />
        <Text style={[styles.title, { color: colors.text }]}>
          NFT Marketplace
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Create, buy, and sell unique digital assets
        </Text>
      </View>

      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: colors.error + '10' }]}>
          <MaterialIcons name="error-outline" size={20} color={colors.error} />
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        </View>
      ) : !account ? (
        <View style={styles.messageContainer}>
          <MaterialIcons name="account-circle" size={48} color={colors.textSecondary} />
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Please connect your wallet to access NFT features.
          </Text>
        </View>
      ) : !username ? (
        <View style={styles.messageContainer}>
          <MaterialIcons name="person-add" size={48} color={colors.textSecondary} />
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            Please create an account to access NFT features.
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.surface }]}
              onPress={() => handleNavigation("CreateNFT")}
              activeOpacity={0.8}
            >
              <View style={[styles.buttonContent, { backgroundColor: colors.primary + '10' }]}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <MaterialIcons name="add-photo-alternate" size={20} color={colors.primary} />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={[styles.buttonTitle, { color: colors.text }]}>Create NFT</Text>
                  <Text style={[styles.buttonSubtitle, { color: colors.textSecondary }]}>
                    Mint your digital asset
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.surface }]}
              onPress={() => handleNavigation("Market")}
              activeOpacity={0.8}
            >
              <View style={[styles.buttonContent, { backgroundColor: colors.primary + '10' }]}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <MaterialIcons name="store" size={20} color={colors.primary} />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={[styles.buttonTitle, { color: colors.text }]}>NFT Marketplace</Text>
                  <Text style={[styles.buttonSubtitle, { color: colors.textSecondary }]}>
                    Browse and buy NFTs
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.surface }]}
              onPress={() => handleNavigation("MyNFT")}
              activeOpacity={0.8}
            >
              <View style={[styles.buttonContent, { backgroundColor: colors.primary + '10' }]}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                  <MaterialIcons name="collections" size={20} color={colors.primary} />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={[styles.buttonTitle, { color: colors.text }]}>My NFTs</Text>
                  <Text style={[styles.buttonSubtitle, { color: colors.textSecondary }]}>
                    View your collection
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerSection: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    gap: 8,
  },
  error: {
    fontSize: 14,
    fontWeight: '500',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
    paddingHorizontal: 8,
  },
  button: {
    borderRadius: 12,
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
    width: 40,
    height: 40,
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

export default NFTHomeScreen;
