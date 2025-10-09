import React, { useEffect, useContext, useRef, useState, Component } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
} from 'react-native';
import { chatAppContext } from '../Context/ChatAppContext';
import { useTheme } from '../Context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: '#d32f2f' }]}>
            Error loading post: {this.state.error?.toString()}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export const PostCard = ({ post, index }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
        delay: index * 100,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: index * 100,
      }),
    ]).start();
  }, [index]);

  const formatDate = (timestamp) => {
    try {
      const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
      if (!timestampNum || isNaN(timestampNum)) {
        return 'Invalid Date';
      }
      const date = new Date(timestampNum * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Validate post data
  if (!post || !post.owner || !post.content) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>Invalid post data</Text>
      </View>
    );
  }

  // Validate and clean imageHash
  const getImageUrl = (imageHash) => {
    if (!imageHash) return 'https://placehold.co/300x200';
    // Check if it's already a raw hash (starts with 'Qm' and is 46 characters long)
    if (/^Qm[1-9A-Za-z]{44}$/.test(imageHash)) {
      return `https://gateway.pinata.cloud/ipfs/${imageHash}`;
    }
    // Handle full URLs
    const match = imageHash.match(/ipfs\/(Qm[1-9A-Za-z]{44})/);
    return match ? `https://gateway.pinata.cloud/ipfs/${match[1]}` : 'https://placehold.co/300x200';
  };

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
        <View style={[styles.cardGradient, { backgroundColor: colors.primary + '08' }]} />

        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '15' }]}>
              <MaterialIcons name="person" size={20} color={colors.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {post.owner.slice(0, 6)}...{post.owner.slice(-4)}
              </Text>
              <Text style={[styles.postDate, { color: colors.textSecondary }]} numberOfLines={1}>
                {formatDate(post.timestamp)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.postContent, { color: colors.text }]} numberOfLines={3}>
          {post.content}
        </Text>

        {post.imageHash && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getImageUrl(post.imageHash) }}
              style={styles.postImage}
              resizeMode="cover"
              onError={(e) => console.error('Image load error:', e.nativeEvent.error)}
            />
          </View>
        )}

        <View style={styles.postFooter}>
          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <MaterialIcons name="favorite" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {(post.likes || []).length}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <MaterialIcons name="chat-bubble-outline" size={18} color={colors.primary} />
              </View>
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {(post.comments || []).length}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </ErrorBoundary>
  );
};

const AllPostScreen = () => {
  const navigation = useNavigation();
  const { fetchMyPosts, myPosts } = useContext(chatAppContext);
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    const loadPosts = async () => {
      try {
        await fetchMyPosts();
      } catch (err) {
        setError(err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    loadPosts();

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
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          opacity: fadeAnim,
          transform: [{ translateY }],
        }
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary + '15' }]}
          onPress={() => navigation.navigate('TotalPost')}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.headerIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <MaterialIcons name="article" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Your Posts</Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primary + '15' }]}
          onPress={() => fetchMyPosts()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={[styles.loadingCircle, { borderColor: colors.primary }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your posts...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <View style={[styles.errorIconContainer, { backgroundColor: colors.error + '15' }]}>
            <MaterialIcons name="error-outline" size={48} color={colors.error} />
          </View>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => fetchMyPosts()}
          >
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={myPosts || []}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => <PostCard post={item} index={index} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.textSecondary + '15' }]}>
                <MaterialIcons name="post-add" size={48} color={colors.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Posts Yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Create your first post to get started
              </Text>
              <TouchableOpacity
                style={[styles.createPostButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('CreatePost')}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={styles.createPostText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </Animated.View>
  );
};

// React Native version of PostScreen
const PostScreen = ({ route }) => {
  const { post } = route.params || {};
  const { currentUserAddress, likePost, commentOnPost } = useContext(chatAppContext);
  const { colors } = useTheme();
  const [commentText, setCommentText] = useState('');
  const [imageUrl, setImageUrl] = useState('https://placehold.co/300x200');
  const [isLiked, setIsLiked] = useState(false);

  const getRawHash = (imageHash) => {
    if (!imageHash) return null;
    // Check if it's already a raw hash
    if (/^Qm[1-9A-Za-z]{44}$/.test(imageHash)) {
      return imageHash;
    }
    // Extract hash from full URL
    const match = imageHash.match(/ipfs\/(Qm[1-9A-Za-z]{44})/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const fetchImageData = async () => {
      if (!post?.imageHash) {
        console.log('No imageHash provided for post:', post);
        return;
      }

      const rawHash = getRawHash(post.imageHash);
      if (!rawHash) {
        console.log('Invalid imageHash:', post.imageHash);
        setImageUrl('https://placehold.co/300x200');
        return;
      }

      // Try fetching JSON
      try {
        const url = `https://gateway.pinata.cloud/ipfs/${rawHash}`;
        console.log('Fetching JSON from:', url);
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched JSON data:', data);
          setImageUrl(data.image || data.imageUrl || 'https://placehold.co/300x200');
          return;
        } else {
          console.error('Failed to fetch JSON:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching JSON:', error);
      }

      // Fallback to direct image URL
      console.log('Attempting direct image URL:', `https://gateway.pinata.cloud/ipfs/${rawHash}`);
      setImageUrl(`https://gateway.pinata.cloud/ipfs/${rawHash}`);
    };

    fetchImageData();
  }, [post?.imageHash]);

  const handleLike = () => {
    if (post?.owner && post?.id) {
      likePost(post.owner, post.id);
      setIsLiked(!isLiked);
    }
  };

  const handleComment = () => {
    if (commentText.trim() === '' || !post?.owner || !post?.id) return;
    commentOnPost(post.owner, post.id, commentText);
    setCommentText('');
  };

  if (!post || !post.owner || !post.content) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>Invalid post data</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={[styles.postScreenContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.postCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.cardGradient, { backgroundColor: colors.primary + '10' }]} />
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
                <MaterialIcons name="person" size={24} color={colors.primary} />
              </View>
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {post.owner.slice(0, 6)}...{post.owner.slice(-4)}
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>

          {post.imageHash && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.postImage}
                resizeMode="cover"
                onError={(e) => console.error('Image load error:', e.nativeEvent.error)}
              />
            </View>
          )}

          <View style={styles.postFooter}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialIcons name="favorite" size={20} color={isLiked ? colors.error : colors.primary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  {(post.likes || []).length}
                </Text>
              </View>
              <View style={styles.statItem}>
                <MaterialIcons name="chat-bubble-outline" size={20} color={colors.primary} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  {(post.comments || []).length}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: isLiked ? colors.error + '20' : colors.primary + '20' }]}
              onPress={handleLike}
            >
              <Text style={[styles.actionButtonText, { color: isLiked ? colors.error : colors.primary }]}>
                Like
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>Comment</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentInputContainer}>
            <TextInput
              style={[styles.commentInput, { borderColor: colors.border, color: colors.text }]}
              placeholder="Write a comment..."
              placeholderTextColor={colors.textSecondary}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity
              style={[styles.commentButton, { backgroundColor: colors.primary }]}
              onPress={handleComment}
              disabled={commentText.trim() === ''}
            >
              <Text style={styles.commentButtonText}>Post</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentsSection}>
            <Text style={[styles.commentsTitle, { color: colors.text }]}>Comments</Text>
            {(post.comments || []).map((comment, index) => (
              <View key={index} style={styles.comment}>
                <Text style={[styles.commentText, { color: colors.text }]}>
                  <Text style={{ fontWeight: '600' }}>
                    {comment.commenter.slice(0, 6)}...{comment.commenter.slice(-4)}
                  </Text>
                  <Text> </Text>
                  <Text>{comment.commentText}</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postScreenContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 24,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  createPostText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postCard: {
    width: '48%', // Slightly less than 50% to account for gap
    marginHorizontal: '1%',
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000', // Changed to black
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  postDate: {
    fontSize: 12,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  imageContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  postFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  commentButton: {
    padding: 10,
    borderRadius: 8,
  },
  commentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  commentsSection: {
    marginTop: 8,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  comment: {
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default AllPostScreen;