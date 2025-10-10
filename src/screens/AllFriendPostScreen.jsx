import React, { useEffect, useContext, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Animated,
  useWindowDimensions,
  TextInput,
  Image,
} from "react-native";
import { chatAppContext } from "../Context/ChatAppContext";
import { useTheme } from "../Context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";

const fallbackImage =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200";

const AllFriendPostScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const {
    currentUserAddress,
    fetchFriendsPosts,
    friendsPosts,
    likePost,
    commentOnPost,
    connectWallet,
  } = useContext(chatAppContext);

  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [isLiked, setIsLiked] = useState({});

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!currentUserAddress) await connectWallet();
        await fetchFriendsPosts();
      } catch { }
      finally {
        setLoading(false);
      }
    };
    initialize();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const getRawHash = (imageHash) => {
    if (!imageHash) return null;
    const match = imageHash.match(/Qm[1-9A-Za-z]{44}/);
    return match ? match[0] : imageHash;
  };

  const fetchImageData = useCallback(
    async (postId, imageHash) => {
      const id = String(postId);
      if (imageUrls[id]) return;

      const rawHash = getRawHash(imageHash);
      if (!rawHash) {
        setImageUrls((prev) => ({ ...prev, [id]: fallbackImage }));
        return;
      }

      const possibleUrls = [
        `https://ipfs.io/ipfs/${rawHash}`,
        `https://gateway.pinata.cloud/ipfs/${rawHash}`,
        `https://coffee-perfect-lemur-527.mypinata.cloud/ipfs/${rawHash}`,
      ];

      for (const url of possibleUrls) {
        try {
          const res = await fetch(url, { method: "HEAD" });
          if (res.ok && res.headers.get("content-type")?.includes("image")) {
            setImageUrls((prev) => ({ ...prev, [id]: url }));
            return;
          }
        } catch {
          continue;
        }
      }

      setImageUrls((prev) => ({ ...prev, [id]: fallbackImage }));
    },
    [imageUrls]
  );

  useEffect(() => {
    if (!friendsPosts?.length) return;
    friendsPosts.forEach((post) => {
      if (post.imageHash) fetchImageData(post.id, post.imageHash);
    });
  }, [friendsPosts, fetchImageData]);

  useEffect(() => {
    const newLikes = {};
    friendsPosts.forEach((p) => {
      newLikes[String(p.id)] = p.likes.includes(currentUserAddress);
    });
    setIsLiked(newLikes);
  }, [friendsPosts, currentUserAddress]);

  const handleLike = (owner, postId) => {
    likePost(owner, postId);
    setIsLiked((prev) => ({ ...prev, [String(postId)]: !prev[String(postId)] }));
  };

  const handleComment = (owner, postId) => {
    if (!commentText[postId]?.trim()) return;
    commentOnPost(owner, postId, commentText[postId]);
    setCommentText((prev) => ({ ...prev, [postId]: "" }));
  };

  const renderPost = ({ item: post }) => {
    const cardWidth = (width - 48) / 2; // padding + gap
    return (
      <View style={[styles.postCard, { width: cardWidth }]}>
        <View style={styles.postHeader}>
          <MaterialIcons name="account-circle" size={40} color={colors.primary} />
          <View style={styles.postHeaderInfo}>
            <Text style={[styles.postUsername, { color: colors.text }]}>
              {post.owner || "Unknown User"}
            </Text>
            {post.timestamp && (
              <Text style={[styles.postTimestamp, { color: colors.textSecondary }]}>
                {formatDistanceToNow(new Date(Number(post.timestamp) * 1000), { addSuffix: true })}
              </Text>
            )}
          </View>
        </View>

        {post.imageHash && (
          <Image
            source={{ uri: imageUrls[String(post.id)] || fallbackImage }}
            style={styles.postImageGrid}
            resizeMode="cover"
          />
        )}

        {post.content && (
          <Text style={[styles.postContent, { color: colors.text }]} numberOfLines={3}>
            {post.content}
          </Text>
        )}

        <View style={styles.postStats}>
          <View style={[styles.statPill, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="thumb-up" size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {post.likes?.length || 0}
            </Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="comment" size={16} color={colors.textSecondary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {post.comments?.length || 0}
            </Text>
          </View>
        </View>

        <View style={styles.postActions}>
          <TouchableOpacity
            onPress={() => handleLike(post.owner, post.id)}
            style={[styles.actionButton, isLiked[String(post.id)] && { backgroundColor: colors.primary }]}
          >
            <MaterialIcons
              name="thumb-up"
              size={16}
              color={isLiked[String(post.id)] ? "#fff" : colors.textSecondary}
            />
            <Text style={[styles.actionText, { color: isLiked[String(post.id)] ? "#fff" : colors.textSecondary }]}>
              Like
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.commentInputContainer}>
          <TextInput
            style={[styles.commentInput, { borderColor: colors.border, color: colors.text }]}
            placeholder="Write a comment..."
            placeholderTextColor={colors.textSecondary}
            value={commentText[post.id] || ""}
            onChangeText={(text) => setCommentText((prev) => ({ ...prev, [post.id]: text }))}
          />
          <TouchableOpacity
            onPress={() => handleComment(post.owner, post.id)}
            disabled={!commentText[post.id]?.trim()}
            style={[
              styles.commentButton,
              !commentText[post.id]?.trim() ? styles.disabledButton : { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.commentButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim, transform: [{ translateY }] }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary + "15" }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <MaterialIcons name="people" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>All Friends' Posts</Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primary + "15" }]}
          onPress={() => fetchFriendsPosts()}
        >
          <MaterialIcons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary }}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={friendsPosts || []}
          renderItem={renderPost}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          numColumns={2} // ✅ two cards per row
          columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.08)" },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  headerContent: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  refreshButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 16 },
  postCard: { backgroundColor: "#fff", borderRadius: 12, padding: 8, elevation: 3 },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  postHeaderInfo: { marginLeft: 8 },
  postUsername: { fontSize: 14, fontWeight: "600" },
  postTimestamp: { fontSize: 10 },
  postContent: { fontSize: 12, marginBottom: 4 },
  postImageGrid: { width: "100%", height: 150, borderRadius: 12, marginBottom: 4 },
  postStats: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  statPill: { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2 },
  statText: { fontSize: 12 },
  postActions: { flexDirection: "row", marginBottom: 4 },
  actionButton: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  actionText: { fontSize: 12, marginLeft: 4 },
  commentInputContainer: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  commentInput: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 6, fontSize: 12 },
  commentButton: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, marginLeft: 4 },
  disabledButton: { backgroundColor: "#ccc" },
  commentButtonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
});

export default AllFriendPostScreen;
