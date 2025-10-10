import React, {
  useEffect,
  useContext,
  useRef,
  useState,
  Component,
} from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { chatAppContext } from "../Context/ChatAppContext";
import { useTheme } from "../Context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// ---------- Error Boundary ----------
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: "#d32f2f" }]}>
            Error loading post: {this.state.error?.toString()}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

// ---------- Utility for IPFS image ----------
const getImageUrl = async (hash) => {
  if (!hash) return "https://picsum.photos/400/300";

  // If hash starts with "http", extract the last part as the actual IPFS hash
  if (hash.startsWith("http")) {
    const match = hash.match(/Qm[1-9A-Za-z]{44}/);
    if (match) hash = match[0];
    else return "https://picsum.photos/400/300";
  }

  const gateways = [
    `https://coffee-perfect-lemur-527.mypinata.cloud/ipfs/${hash}`,
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://ipfs.io/ipfs/${hash}`,
  ];

  for (const gateway of gateways) {
    try {
      const res = await fetch(gateway, { method: "GET" });
      if (res.ok) return gateway;
    } catch (err) {
      console.log("Gateway failed:", gateway);
    }
  }

  return "https://picsum.photos/400/300";
};


// ---------- Post Card ----------
const PostCard = ({ post, index }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImg, setLoadingImg] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const loadImage = async () => {
      try {
        const url = await getImageUrl(post?.imageHash);
        setImageUrl(url);
      } catch (err) {
        console.error("Image fetch error:", err);
        setImageUrl("https://picsum.photos/400/300");
      } finally {
        setLoadingImg(false);
      }
    };

    loadImage();
  }, [post?.imageHash]);

  const formatDate = (timestamp) => {
    try {
      const ts = typeof timestamp === "bigint" ? Number(timestamp) : timestamp;
      if (!ts || isNaN(ts)) return "Invalid Date";
      return new Date(ts * 1000).toLocaleString();
    } catch {
      return "Invalid Date";
    }
  };

  if (!post?.owner || !post?.content) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Invalid post data
        </Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <Animated.View
        style={[
          styles.postCard,
          {
            backgroundColor: colors.surface,
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View
              style={[
                styles.avatarContainer,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <MaterialIcons name="person" size={20} color={colors.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text
                style={[styles.userName, { color: colors.text }]}
                numberOfLines={1}
              >
                {post.owner.slice(0, 6)}...{post.owner.slice(-4)}
              </Text>
              <Text style={[styles.postDate, { color: colors.textSecondary }]}>
                {formatDate(post.timestamp)}
              </Text>
            </View>
          </View>
        </View>

        <Text
          style={[styles.postContent, { color: colors.text }]}
          numberOfLines={4}
        >
          {post.content}
        </Text>

        {post.imageHash && (
          <View style={styles.imageContainer}>
            {loadingImg ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Image
                source={{ uri: imageUrl }}
                style={styles.postImage}
                onError={() => setImageUrl("https://picsum.photos/400/300")}
              />
            )}
          </View>
        )}

        <View style={styles.postFooter}>
          <TouchableOpacity style={styles.statItem}>
            <MaterialIcons name="favorite" size={18} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {(post.likes || []).length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.statItem}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {(post.comments || []).length}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ErrorBoundary>
  );
};

// ---------- AllPostScreen ----------
const AllPostScreen = () => {
  const navigation = useNavigation();
  const { fetchMyPosts, myPosts } = useContext(chatAppContext);
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        await fetchMyPosts();
      } catch (err) {
        setError(err.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary + "15" }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Your Posts
        </Text>

        <TouchableOpacity
          style={[
            styles.refreshButton,
            { backgroundColor: colors.primary + "15" },
          ]}
          onPress={() => fetchMyPosts()}
        >
          <MaterialIcons name="refresh" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your posts...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={myPosts || []}
          numColumns={2}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => <PostCard post={item} index={index} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Posts Yet
              </Text>
              <TouchableOpacity
                style={[styles.createPostButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate("CreatePost")}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={styles.createPostText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  postCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 3 },
      ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 3 },
    }),
  },
  postHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  userDetails: { marginLeft: 8 },
  userName: { fontWeight: "600" },
  postDate: { fontSize: 12 },
  postContent: { paddingHorizontal: 12, paddingBottom: 8, fontSize: 14 },
  imageContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  postImage: { width: "100%", height: 150, borderRadius: 10 },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 12 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  errorText: { fontSize: 16, fontWeight: "600" },
  retryButton: { padding: 10, borderRadius: 8, backgroundColor: "#1976d2" },
  retryText: { color: "#fff", fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: "600" },
  createPostButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  createPostText: { color: "#fff", fontWeight: "600" },
});

export default AllPostScreen;
