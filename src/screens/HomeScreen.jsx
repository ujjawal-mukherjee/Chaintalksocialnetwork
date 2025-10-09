import React, { useRef, useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../Context/ThemeContext';
import { chatAppContext } from '../Context/ChatAppContext';
import { MaterialIcons } from '@expo/vector-icons';

import enc from '../assets/enc.jpg';
import network from '../assets/network.jpg';
import cover from '../assets/cover.png';
import buddy from '../assets/buddy.png';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;
  const { colors } = useTheme();
  const { account, currentUserName } = useContext(chatAppContext);
  const scrollRef = useRef(null);
  const [featuresOffsetY, setFeaturesOffsetY] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

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

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  const renderSection = (content, style) => (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      {content}
    </Animated.View>
  );

  const renderQuickAction = (icon, title, onPress) => (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.15)` }]}>
        <MaterialIcons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.quickActionText, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <Animated.ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >

          <View style={[styles.heroSection, { backgroundColor: colors.surface }]}>
            <View style={styles.heroText}>
              <Text style={[styles.title, { color: colors.text }]}>
                Welcome to <Text style={[styles.highlight, { color: colors.primary }]}>ChainTalk</Text>
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Experience the power of decentralized and secure messaging.
              </Text>
              {!account ? (
                <TouchableOpacity
                  style={[styles.getStartedBtn, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('AllUsers')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.getStartedText, { color: colors.buttonText }]}>Connect Wallet</Text>
                  <MaterialIcons name="account-balance-wallet" size={20} color={colors.buttonText} style={styles.btnIcon} />
                </TouchableOpacity>
              ) : !currentUserName ? (
                <TouchableOpacity
                  style={[styles.getStartedBtn, { backgroundColor: colors.primary }]}
                  onPress={() => navigation.navigate('AllUsers')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.getStartedText, { color: colors.buttonText }]}>Create Account</Text>
                  <MaterialIcons name="person-add" size={20} color={colors.buttonText} style={styles.btnIcon} />
                </TouchableOpacity>
              ) : (
                <View style={styles.quickActionsContainer}>
                  {renderQuickAction('chat', 'Chats', () => navigation.navigate('Chats'))}
                  {renderQuickAction('people', 'Friends', () => navigation.navigate('AllUsers'))}
                  {renderQuickAction('add-photo-alternate', 'Create Post', () => navigation.navigate('CreatePost'))}
                  {renderQuickAction('store', 'NFT Market', () => navigation.navigate('NFTStack'))}
                </View>
              )}
            </View>
            <Image source={buddy} style={styles.heroImage} resizeMode="contain" />
          </View>


          <View style={styles.featuresSection}>
            <FeatureCard
              image={enc}
              title="End-to-End Encryption"
              description="Your messages are completely private and secure."
              colors={colors}
              icon="🔒"
            />
            <FeatureCard
              image={network}
              title="Decentralized Network"
              description="No central servers – pure peer-to-peer communication."
              colors={colors}
              icon="🌐"
            />
            <FeatureCard
              image={cover}
              title="Seamless Communication"
              description="Fast, reliable, and real-time chat experience."
              colors={colors}
              icon="⚡"
            />
          </View>


          <View style={[styles.statsSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Platform Stats</Text>
            <View style={styles.statsGrid}>
              <StatItem
                icon="people"
                value="10K+"
                label="Active Users"
                colors={colors}
              />
              <StatItem
                icon="chat"
                value="1M+"
                label="Messages"
                colors={colors}
              />
              <StatItem
                icon="store"
                value="5K+"
                label="NFTs"
                colors={colors}
              />
              <StatItem
                icon="security"
                value="100%"
                label="Secure"
                colors={colors}
              />
            </View>
          </View>


          <View style={[styles.benefitsSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Why Choose ChainTalk?</Text>
            <View style={styles.benefitsGrid}>
              <BenefitItem
                icon="🔒"
                title="Secure"
                description="End-to-end encryption for all messages"
                colors={colors}
              />
              <BenefitItem
                icon="⚡"
                title="Fast"
                description="Lightning-fast message delivery"
                colors={colors}
              />
              <BenefitItem
                icon="🌐"
                title="Decentralized"
                description="No central servers, pure P2P"
                colors={colors}
              />
              <BenefitItem
                icon="🔐"
                title="Private"
                description="Your data stays with you"
                colors={colors}
              />
            </View>
          </View>


          <View style={[styles.footer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              © 2025 ChainTalk. Built on Decentralization.
            </Text>
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

const FeatureCard = ({ image, title, description, colors, icon }) => (
  <Animated.View
    style={[
      styles.featureCard,
      {
        backgroundColor: colors.surface,
        transform: [{ scale: 1 }],
      }
    ]}
  >
    <View style={[styles.featureIconContainer, { backgroundColor: colors.primary + '15' }]}>
      <Text style={styles.featureIcon}>{icon}</Text>
    </View>
    <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>{description}</Text>
  </Animated.View>
);

const StatItem = ({ icon, value, label, colors }) => (
  <View style={[styles.statItem, { backgroundColor: colors.surface }]}>
    <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
      <MaterialIcons name={icon} size={24} color={colors.primary} />
    </View>
    <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
);

const BenefitItem = ({ icon, title, description, colors }) => (
  <View style={[styles.benefitItem, { backgroundColor: colors.surface }]}>
    <View style={[styles.benefitIconContainer, { backgroundColor: colors.primary + '15' }]}>
      <Text style={[styles.benefitIcon, { color: colors.primary }]}>{icon}</Text>
    </View>
    <Text style={[styles.benefitTitle, { color: colors.text }]}>{title}</Text>
    <Text style={[styles.benefitDescription, { color: colors.textSecondary }]}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  heroText: {
    flex: 1,
    marginRight: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  highlight: {
    // color will be applied dynamically
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  getStartedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  btnIcon: {
    // color will be applied dynamically
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
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
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  heroImage: {
    width: screenWidth * 0.4,
    height: screenWidth * 0.4,
    maxHeight: 200,
    maxWidth: 200,
  },
  featuresSection: {
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsSection: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 16,
  },
  statItem: {
    width: (screenWidth - 80) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  benefitsSection: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  benefitItem: {
    width: (screenWidth - 80) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 24,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  benefitDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 40 : 24,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  footerText: {
    fontSize: 14,
  },
});

export default HomeScreen;
