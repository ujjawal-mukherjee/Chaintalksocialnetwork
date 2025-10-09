import React, { useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { chatAppContext } from "../Context/ChatAppContext";
import { useTheme } from "../Context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const TokenScreen = () => {
  const { fetchMyRewards, myRewardTokens, error, loading } = useContext(chatAppContext);
  const { colors } = useTheme();
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
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

  useEffect(() => {
    fetchMyRewards();
  }, []);

  const handleRefresh = () => {
    fetchMyRewards();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Tokens</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={loading}
        >
          <MaterialIcons 
            name="refresh" 
            size={24} 
            color={loading ? colors.textSecondary : colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading your tokens...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={48} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={handleRefresh}
            >
              <MaterialIcons name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View
            style={[
              styles.tokenContainer,
              {
                backgroundColor: colors.surface,
                opacity: fadeAnim,
                transform: [
                  { translateY },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <View style={[styles.tokenIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <MaterialIcons name="account-balance-wallet" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.tokenAmount, { color: colors.text }]}>
              {myRewardTokens || '0'}
            </Text>
            <Text style={[styles.tokenLabel, { color: colors.textSecondary }]}>
              Reward Tokens
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.tokenInfo}>
              <View style={styles.infoItem}>
                <MaterialIcons name="stars" size={24} color={colors.primary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Earned
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {myRewardTokens || '0'}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialIcons name="shopping-cart" size={24} color={colors.primary} />
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Spent
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>0</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 8,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tokenContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tokenIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tokenLabel: {
    fontSize: 18,
    marginBottom: 24,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 24,
  },
  tokenInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  infoItem: {
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '600',
  },
});

export default TokenScreen;