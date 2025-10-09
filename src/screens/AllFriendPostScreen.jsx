import React, { useEffect, useContext, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar,
  Animated,
  useWindowDimensions,
  TextInput,
  Image,
} from 'react-native';
import { chatAppContext } from '../Context/ChatAppContext';
import { useTheme } from '../Context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { formatDistanceToNow } from 'date-fns';

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
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [isLiked, setIsLiked] = useState({});
  const [fetchedPostIds, setFetchedPostIds] = useState(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    const initialize = async () => {
      try {
        if (!currentUserAddress) {
          await connectWallet();
        }
        await fetchFriendsPosts();
      } catch (err) {
        setError(err.message || 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    initialize();

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
  }, [currentUserAddress, connectWallet, fetchFriendsPosts]);

  const getRawHash = (imageHash) => {
    if (!imageHash) return null;
    const match = imageHash.match(/ipfs\/(Qm[1-9A-Za-z]{44})/);
    return match ? match[1] : imageHash;
  };

  const fetchImageData = useCallback(async (postId, imageHash) => {
    const id = String(postId);
    if (!imageHash || fetchedPostIds.has(id)) {
      console.log(`Skipping fetch for post ${id}: already fetched or no imageHash`);
      return;
    }

    const rawHash = getRawHash(imageHash);
    const url = `https://gateway.pinata.cloud/ipfs/${rawHash}`;
    console.log(`Fetching image for post ${id}: ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      console.log(`Content-Type for ${url}: ${contentType}`);

      let imageUrl;
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        imageUrl = data.image || data.imageUrl || 'https://placehold.co/300x200';
      } else {
        imageUrl = url;
      }

      setImageUrls((prev) => ({ ...prev, [id]: imageUrl }));
      setFetchedPostIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(id);
        console.log(`Updated fetchedPostIds:`, Array.from(newSet));
        return newSet;
      });
    } catch (err) {
      console.error(`Error fetching image for post ${id}:`, err.message);
      setImageUrls((prev) => ({ ...prev, [id]: 'https://placehold.co/300x200' }));
      setFetchedPostIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(id);
        console.log(`Updated fetchedPostIds (error):`, Array.from(newSet));
        return newSet;
      });
    }
  }, [fetchedPostIds]);

  useEffect(() => {
    console.log('friendsPosts:', friendsPosts.map(post => ({ id: post.id, imageHash: post.imageHash, comments: post.comments })));
    friendsPosts.forEach((post) => {
      fetchImageData(post.id, post.imageHash);
    });
  }, [friendsPosts, fetchImageData]);

  useEffect(() => {
    const newIsLiked = {};
    friendsPosts.forEach((post) => {
      newIsLiked[String(post.id)] = post.likes.includes(currentUserAddress);
    });
    setIsLiked(newIsLiked);
  }, [friendsPosts, currentUserAddress]);

  const handleLike = (owner, postId) => {
    likePost(owner, postId);
    setIsLiked((prev) => ({ ...prev, [String(postId)]: !prev[String(postId)] }));
  };

  const handleComment = (owner, postId) => {
    if (!commentText[postId]?.trim()) return;
    commentOnPost(owner, postId, commentText[postId]);
    setCommentText((prev) => ({ ...prev, [postId]: '' }));
  };

  const renderPost = ({ item: post }) => (
    <View style={[styles.postCard, !isMobile && styles.postCardDesktop]}>
      <View style={styles.postHeader}>
        <MaterialIcons name="account-circle" size={40} color={colors.primary} />
        <View style={styles.postHeaderInfo}>
          <Text style={[styles.postUsername, { color: colors.text }]}>
            {post.owner || 'Unknown User'}
          </Text>
          {post.timestamp && (
            <Text style={[styles.postTimestamp, { color: colors.textSecondary }]}>
              {formatDistanceToNow(new Date(Number(post.timestamp) * 1000), { addSuffix: true })}
            </Text>
          )}
        </View>
      </View>

      {post.content && (
        <Text style={[styles.postContent, { color: colors.text }]}>{post.content}</Text>
      )}

      {post.imageHash && (
        <Image
          source={{ uri: imageUrls[String(post.id)] || 'https://placehold.co/300x200' }}
          style={styles.postImage}
          resizeMode="cover"
          onError={() => setImageUrls((prev) => ({ ...prev, [String(post.id)]: 'https://placehold.co/300x200' }))}
        />
      )}

      <View style={styles.postStats}>
        <View style={[styles.statPill, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="thumb-up" size={16} color={colors.textSecondary} style={styles.statIcon} />
          <Text style={[styles.statText, { color: colors.textSecondary }]}>
            {post.likes?.length || 0}
          </Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="comment" size={16} color={colors.textSecondary} style={styles.statIcon} />
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
          <MaterialIcons name="thumb-up" size={16} color={isLiked[String(post.id)] ? '#fff' : colors.textSecondary} />
          <Text style={[styles.actionText, { color: isLiked[String(post.id)] ? '#fff' : colors.textSecondary }]}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.surface }]}>
          <MaterialIcons name="comment" size={16} color={colors.textSecondary} />
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>Comment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.commentInputContainer}>
        <TextInput
          style={[styles.commentInput, { borderColor: colors.border, color: colors.text }]}
          placeholder="Write a comment..."
          placeholderTextColor={colors.textSecondary}
          value={commentText[post.id] || ''}
          onChangeText={(text) => setCommentText((prev) => ({ ...prev, [post.id]: text }))}
        />
        <TouchableOpacity
          onPress={() => handleComment(post.owner, post.id)}
          disabled={!commentText[post.id]?.trim()}
          style={[styles.commentButton, !commentText[post.id]?.trim() ? styles.disabledButton : { backgroundColor: colors.primary }]}
        >
          <Text style={styles.commentButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.commentsSection}>
        <Text style={[styles.commentsTitle, { color: colors.text }]}>Comments</Text>
        {post.comments?.length > 0 &&
          post.comments
            .filter((comment) => {
              const isValid = comment?.commenter && typeof comment.commentText === 'string' && comment.commentText.trim() && comment.commentText !== '.';
              if (!isValid) {
                console.warn(`Invalid comment for post ${post.id}:`, comment);
              }
              return isValid;
            })
            .map((comment, index) => (
              <View key={index} style={styles.comment}>
                <MaterialIcons name="account-circle" size={24} color={colors.textSecondary} style={styles.commentIcon} />
                <View>
                  <Text style={[styles.commenter, { color: colors.text }]}>{comment.commenter}</Text>
                  <Text style={[styles.commentText, { color: colors.textSecondary }]}>{comment.commentText}</Text>
                </View>
              </View>
            ))}
      </View>
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.primary + '15' }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.headerIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <MaterialIcons name="people" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>All Friends' Posts</Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: colors.primary + '15' }]}
          onPress={() => fetchFriendsPosts()}
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
            Loading friends' posts...
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
            onPress={() => fetchFriendsPosts()}
          >
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={friendsPosts || []}
          renderItem={renderPost}
          keyExtractor={(item, index) => String(index)}
          contentContainerStyle={[
            styles.listContent,
            isMobile && styles.mobileListContent,
          ]}
          showsVerticalScrollIndicator={false}
          numColumns={isMobile ? 1 : 2}
          columnWrapperStyle={!isMobile && styles.columnWrapper}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.textSecondary + '15' }]}>
                <MaterialIcons name="people" size={48} color={colors.textSecondary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No Posts Yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                When your friends share posts, they'll appear here
              </Text>
              <TouchableOpacity
                style={[styles.addFriendsButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('AddFriends')}
              >
                <MaterialIcons name="person-add" size={20} color="#fff" />
                <Text style={styles.addFriendsText}>Add Friends</Text>
              </TouchableOpacity>
            </View>
          )}
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
    padding: 20,
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
    textAlign: 'center',
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
  mobileListContent: {
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  addFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  addFriendsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  postCardDesktop: {
    flex: 1,
    marginHorizontal: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postHeaderInfo: {
    marginLeft: 8,
  },
  postUsername: {
    fontSize: 16,
    fontWeight: '600',
  },
  postTimestamp: {
    fontSize: 12,
  },
  postContent: {
    fontSize: 14,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statIcon: {
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
  },
  postActions: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
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
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentIcon: {
    marginRight: 8,
  },
  commenter: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentText: {
    fontSize: 14,
  },
});

export default AllFriendPostScreen;