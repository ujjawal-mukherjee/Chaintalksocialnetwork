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
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { chatAppContext } from "../Context/ChatAppContext";
import { useTheme } from '../Context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { ethers } from 'ethers';

const MarketScreen = () => {
  const { allNFTs, buyNFT, loading, error } = useContext(chatAppContext);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [localError, setLocalError] = useState(null);

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
  const formattedNFTs = allNFTs?.map((nft) => ({
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
  const filteredNFTs = formattedNFTs.filter(
    (nft) =>
      nft.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuy = async (nft) => {
    try {
      if (!nft.id || !nft.price) {
        console.log("Invalid NFT:", nft);
        throw new Error("Invalid NFT data");
      }
      await buyNFT(nft.id, nft.price);
      setLocalError(null);
    } catch (err) {
      console.error("Buy NFT error:", err);
      setLocalError(err.message || "Failed to buy NFT");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Add your refresh logic here
      setLocalError(null);
    } catch (err) {
      setLocalError(err.message || 'Failed to refresh');
    }
    setRefreshing(false);
  };

  const renderNFTItem = ({ item }) => {
    if (!item) return null;

    const imageUri = item.previewHash || item.originalHash || "https://via.placeholder.com/150";
    const title = item.title || "Untitled NFT";
    const description = item.description || "No description available";
    const price = item.price ? `${item.price} ETH` : "Price not set";
    const owner = item.owner || "Unknown Owner";
    const tokenId = item.id;

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
        <View style={styles.nftCardContent}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.nftImage}
              defaultSource={{ uri: "https://via.placeholder.com/150?text=No+Image" }}
              onError={() => console.log("Image failed to load")}
            />
            <View style={[styles.priceTag, { backgroundColor: colors.primary + "20" }]}>
              <MaterialIcons name="currency-ethereum" size={16} color={colors.primary} />
              <Text style={[styles.priceTagText, { color: colors.primary }]}>{price}</Text>
            </View>
          </View>

          <View style={styles.nftInfo}>
            <View style={styles.nftHeader}>
              <Text style={[styles.nftTitle, { color: colors.text }]} numberOfLines={1}>
                {title}
              </Text>
            </View>

            <Text
              style={[styles.nftDescription, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {description}
            </Text>

            <View style={styles.nftFooter}>
              <View style={styles.ownerContainer}>
                <MaterialIcons name="person" size={16} color={colors.textSecondary} />
                <Text
                  style={[styles.ownerText, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {owner}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.buyButton, { backgroundColor: colors.primary }]}
                onPress={() => handleBuy(item)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="shopping-cart" size={16} color="#fff" />
                    <Text style={styles.buyButtonText}>Buy</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
          Loading marketplace...
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
          onPress={onRefresh}
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>NFT Marketplace</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <MaterialIcons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search NFTs..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialIcons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {!filteredNFTs || filteredNFTs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="store" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {searchQuery ? 'No NFTs found matching your search' : 'No NFTs available in the marketplace'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNFTs}
          renderItem={renderNFTItem}
          keyExtractor={(item, index) => item?.id || index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="store" size={64} color={colors.textSecondary} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  nftCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
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
  nftCardContent: {
    flexDirection: 'row',
    height: 160,
  },
  imageContainer: {
    width: 160,
    height: '100%',
    position: 'relative',
  },
  nftImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  priceTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priceTagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nftInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  nftHeader: {
    marginBottom: 8,
  },
  nftTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  nftDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  nftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  ownerText: {
    fontSize: 14,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
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
    padding: 20,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MarketScreen;
