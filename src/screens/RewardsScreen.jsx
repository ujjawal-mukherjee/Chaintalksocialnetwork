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

const RewardsScreen = () => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const [rewards, setRewards] = useState({
    totalTokens: 1250,
    availableTokens: 850,
    lockedTokens: 400,
    history: [
      {
        id: 1,
        type: 'earn',
        amount: 100,
        description: 'Achievement: Chat Master',
        date: '2 hours ago',
        icon: 'stars',
      },
      {
        id: 2,
        type: 'spend',
        amount: -50,
        description: 'Premium Theme Unlocked',
        date: '1 day ago',
        icon: 'palette',
      },
      {
        id: 3,
        type: 'earn',
        amount: 200,
        description: 'Achievement: Early Adopter',
        date: '2 days ago',
        icon: 'rocket-launch',
      },
      {
        id: 4,
        type: 'earn',
        amount: 75,
        description: 'Daily Login Bonus',
        date: '3 days ago',
        icon: 'login',
      },
    ],
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderRewardItem = (item) => {
    const isEarned = item.type === 'earn';
    const amountColor = isEarned ? colors.primary : colors.error;
    const iconBackgroundColor = `rgba(${parseInt(amountColor.slice(1,3), 16)}, ${parseInt(amountColor.slice(3,5), 16)}, ${parseInt(amountColor.slice(5,7), 16)}, 0.15)`;

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.rewardItem,
          {
            backgroundColor: colors.surface,
            opacity: fadeAnim,
            transform: [{ translateY }],
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
          <MaterialIcons name={item.icon} size={24} color={amountColor} />
        </View>
        <View style={styles.rewardContent}>
          <Text style={[styles.rewardDescription, { color: colors.text }]}>
            {item.description}
          </Text>
          <Text style={[styles.rewardDate, { color: colors.textSecondary }]}>
            {item.date}
          </Text>
        </View>
        <Text style={[styles.rewardAmount, { color: amountColor }]}>
          {isEarned ? '+' : ''}{item.amount}
        </Text>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Rewards</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Your earned tokens and rewards
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.balanceCard,
          {
            backgroundColor: colors.surface,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <View style={styles.balanceHeader}>
          <MaterialIcons name="account-balance-wallet" size={24} color={colors.primary} />
          <Text style={[styles.balanceTitle, { color: colors.text }]}>Total Balance</Text>
        </View>
        <Text style={[styles.balanceAmount, { color: colors.text }]}>
          {rewards.totalTokens} tokens
        </Text>
        <View style={styles.balanceDetails}>
          <View style={styles.balanceDetail}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Available</Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}>
              {rewards.availableTokens}
            </Text>
          </View>
          <View style={styles.balanceDetail}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Locked</Text>
            <Text style={[styles.detailValue, { color: colors.secondary }]}>
              {rewards.lockedTokens}
            </Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
        <ScrollView
          style={styles.historyList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.historyListContent}
        >
          {rewards.history.map((item) => renderRewardItem(item))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[
          styles.redeemButton,
          { 
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            borderWidth: 1,
          }
        ]}
        onPress={() => {/* Handle redeem */}}
      >
        <MaterialIcons name="card-giftcard" size={24} color={colors.buttonText} />
        <Text style={[styles.redeemButtonText, { color: colors.buttonText }]}>Redeem Rewards</Text>
      </TouchableOpacity>
    </View>
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  balanceCard: {
    margin: 16,
    padding: 20,
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
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  balanceDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    paddingBottom: 20,
  },
  rewardItem: {
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
  rewardContent: {
    flex: 1,
    marginRight: 16,
  },
  rewardDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rewardDate: {
    fontSize: 13,
  },
  rewardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  redeemButton: {
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
  redeemButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default RewardsScreen; 