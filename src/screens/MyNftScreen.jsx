import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { chatAppContext } from "../Context/ChatAppContext";
import { useTheme } from '../Context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { ethers } from 'ethers';

const MyNFTScreen = () => {
  const { account, username, error, fetchMyNFTs, myNFTs, loading } = useContext(chatAppContext);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [localError, setLocalError] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Transform raw NFT data
  const formattedNFTs = myNFTs?.map((nft) => ({
    id: nft[0] ? nft[0].toString() : "0",
    owner: nft[1] || "",
    title: nft[2] || "",
    price: nft[3] ? ethers.formatEther(nft[3]) : "0",
    description: nft[4] || "",
    originalHash: nft[5] || "",
    previewHash: nft[6] || "",
    timestamp: nft[7] ? nft[7].toString() : "0",
    isSold: nft[8] || false,
  })) || [];

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

  useEffect(() => {
    if (account) {
      console.log('Account found, fetching NFTs...');
      fetchNFTs();
    } else {
      console.log('No account found');
    }
  }, [account]);

  useEffect(() => {
    console.log('Formatted NFTs:', formattedNFTs);
  }, [myNFTs]);

  const fetchNFTs = async () => {
    try {
      await fetchMyNFTs();
      setLocalError(null);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      setLocalError(err.message || 'Failed to fetch NFTs');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNFTs();
    setRefreshing(false);
  };

  const renderNFTItem = ({ item }) => {
    if (!item) return null;

    // Construct Pinata URL from raw IPFS hash
    const imageUri = item.originalHash
      ? `https://gateway.pinata.cloud/ipfs/${item.originalHash.replace('https://gateway.pinata.cloud/ipfs/', '')}`
      : item.previewHash
        ? `https://gateway.pinata.cloud/ipfs/${item.previewHash.replace('https://gateway.pinata.cloud/ipfs/', '')}`
        : 'https://via.placeholder.com/150';
    const title = item.title || 'Untitled NFT';
    const description = item.description || 'No description available';
    const price = item.price ? `${item.price} ETH` : 'Price not set';

    return (
      <Animated.View
        style={[
          styles.nftCard,
          {
            backgroundColor: colors.surface,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.nftImage}
          defaultSource={{ uri: 'https://via.placeholder.com/150?text=No+Image' }}
          onError={(e) => console.log(`Image failed to load: ${imageUri}, error: ${e.nativeEvent.error}`)}
        />
        <View style={styles.nftInfo}>
          <Text style={[styles.nftTitle, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.nftDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
          <Text style={[styles.nftDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            Hash of Image: {item.originalHash}
          </Text>
          <View style={styles.nftDetails}>
            <View style={styles.priceContainer}>
              <MaterialIcons name="attach-money" size={16} color={colors.primary} />
              <Text style={[styles.price, { color: colors.primary }]}>
                {price}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.sellButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => navigation.navigate("Market", { nft: item })}
            >
              <MaterialIcons name="sell" size={16} color={colors.primary} />
              <Text style={[styles.sellButtonText, { color: colors.primary }]}>Sell</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading your NFTs...
        </Text>
      </View>
    );
  }

  if (error || localError) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <MaterialIcons name="error-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error || localError}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={fetchNFTs}
        >
          <MaterialIcons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My NFTs</Text>
        <View style={styles.headerRight} />
      </View>

      {!formattedNFTs || formattedNFTs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="collections" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            You haven't created any NFTs yet
          </Text>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("CreateNFT")}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create NFT</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={formattedNFTs}
          renderItem={renderNFTItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="collections" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No NFTs found
              </Text>
            </View>
          }
        />
      )}
    </Animated.View>
  );
};

// Styles remain unchanged
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  nftCard: {
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
  nftImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  nftInfo: {
    padding: 16,
    gap: 8,
  },
  nftTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  nftDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  nftDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '500',
  },
  sellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 4,
  },
  sellButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
    padding: 16,
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
    borderRadius: 24,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyNFTScreen;