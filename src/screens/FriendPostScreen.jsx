
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { chatAppContext } from '../Context/ChatAppContext';

const FriendPostScreen = () => {
  const navigation = useNavigation();
  const {
    currentUserAddress,
    fetchFriendsPosts,
    friendsPosts,
    likePost,
    commentOnPost,
    loading,
    error,
    connectWallet,
  } = useContext(chatAppContext);

  const [commentText, setCommentText] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [isLiked, setIsLiked] = useState({});

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
        console.error('Error initializing:', err);
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

  const fetchImageData = async (postId, imageHash) => {
    if (!imageHash) return;

    const rawHash = getRawHash(imageHash);
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${rawHash}`);
      if (response.ok) {
        const data = await response.json();
        setImageUrls((prev) => ({
          ...prev,
          [postId]: data.image || data.imageUrl || 'https://placehold.co/300x200',
        }));
        return;
      }
    } catch (err) {
      console.error('Error fetching image:', err);
    }
    setImageUrls((prev) => ({ ...prev, [postId]: imageHash }));
  };

  useEffect(() => {
    friendsPosts.forEach((post) => {
      fetchImageData(post.id, post.imageHash);
      setIsLiked((prev) => ({
        ...prev,
        [post.id]: post.likes.includes(currentUserAddress),
      }));
    });
  }, [friendsPosts, currentUserAddress]);

  const handleLike = (owner, postId) => {
    likePost(owner, postId);
    setIsLiked((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleComment = (owner, postId) => {
    if (!commentText[postId]?.trim()) return;
    commentOnPost(owner, postId, commentText[postId]);
    setCommentText((prev) => ({ ...prev, [postId]: '' }));
  };

  const renderPost = ({ item: post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <MaterialIcons name="account-circle" size={40} color="#4f8cff" />
        <View style={styles.postHeaderInfo}>
          <Text style={styles.postUsername}>{post.owner}</Text>
          <Text style={styles.postTimestamp}>
            {post.timestamp
              ? formatDistanceToNow(new Date(Number(post.timestamp) * 1000), { addSuffix: true })
              : ''}
          </Text>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.imageHash && (
        <Image
          source={{ uri: imageUrls[post.id] || 'https://placehold.co/300x200' }}
          style={styles.postImage}
          onError={() => setImageUrls((prev) => ({ ...prev, [post.id]: 'https://placehold.co/300x200' }))}
        />
      )}

      <View style={styles.postStats}>
        <View style={styles.statPill}>
          <MaterialIcons name="thumb-up" size={16} color="#666" style={styles.statIcon} />
          <Text style={styles.statText}>{post.likes.length}</Text>
        </View>
        <View style={styles.statPill}>
          <MaterialIcons name="comment" size={16} color="#666" style={styles.statIcon} />
          <Text style={styles.statText}>{post.comments.length}</Text>
        </View>
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity
          onPress={() => handleLike(post.owner, post.id)}
          style={[styles.actionButton, isLiked[post.id] ? styles.likedButton : {}]}
        >
          <MaterialIcons name="thumb-up" size={16} color={isLiked[post.id] ? '#fff' : '#666'} />
          <Text style={[styles.actionText, isLiked[post.id] ? styles.likedText : {}]}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="comment" size={16} color="#666" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Write a comment..."
          value={commentText[post.id] || ''}
          onChangeText={(text) => setCommentText((prev) => ({ ...prev, [post.id]: text }))}
        />
        <TouchableOpacity
          onPress={() => handleComment(post.owner, post.id)}
          disabled={!commentText[post.id]?.trim()}
          style={[styles.commentButton, !commentText[post.id]?.trim() ? styles.disabledButton : {}]}
        >
          <Text style={styles.commentButtonText}>Post</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments</Text>
        {post.comments.map((comment, index) => (
          <View key={index} style={styles.comment}>
            <MaterialIcons name="account-circle" size={24} color="#aaa" style={styles.commentIcon} />
            <View>
              <Text style={styles.commenter}>{comment.commenter}</Text>
              <Text style={styles.commentText}>{comment.commentText}</Text>
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
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: '#f5f5f5',
        },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color="#4f8cff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <MaterialIcons name="group" size={24} color="#4f8cff" />
          </View>
          <Text style={styles.headerTitle}>Friend's Posts</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchFriendsPosts}
          activeOpacity={0.7}
        >
          <MaterialIcons name="refresh" size={20} color="#4f8cff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCircle}>
            <ActivityIndicator size="large" color="#4f8cff" />
          </View>
          <Text style={styles.loadingText}>Loading friend's posts...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <MaterialIcons name="error-outline" size={48} color="#e63946" />
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFriendsPosts}>
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={friendsPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <MaterialIcons name="group" size={48} color="#666" />
              </View>
              <Text style={styles.emptyTitle}>No Posts Yet</Text>
              <Text style={styles.emptyText}>
                When your friends share posts, they'll appear here
              </Text>
              <TouchableOpacity
                style={styles.addFriendsButton}
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
    paddingVertical: 16,
    backgroundColor: '#fff',
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
    backgroundColor: '#4f8cff15',
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
    backgroundColor: '#4f8cff15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f8cff15',
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
    borderColor: '#4f8cff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
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
    backgroundColor: '#e6394615',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e63946',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#4f8cff',
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
    backgroundColor: '#66615',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#666',
    marginBottom: 16,
  },
  addFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#4f8cff',
    gap: 8,
  },
  addFriendsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#333',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  postContent: {
    fontSize: 14,
    color: '#333',
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
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statIcon: {
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  postActions: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  likedButton: {
    backgroundColor: '#4f8cff',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  likedText: {
    color: '#fff',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  commentButton: {
    backgroundColor: '#4f8cff',
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
    color: '#333',
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
    color: '#333',
  },
  commentText: {
    fontSize: 14,
    color: '#666',
  },
});

export default FriendPostScreen;
