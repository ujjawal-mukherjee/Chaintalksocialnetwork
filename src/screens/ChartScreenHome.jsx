import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';

// Dummy placeholder components – replace with your actual components
const Filter = () => (
  <View style={styles.filterBox}>
    <Text style={styles.sectionTitle}>Filter</Text>
  </View>
);

const Friend = () => (
  <View style={styles.friendBox}>
    <Text style={styles.sectionTitle}>Friends</Text>
    {/* Replace this with your friend list/map */}
    <Text style={styles.friendPlaceholder}>No friends yet. Start chatting!</Text>
  </View>
);

const ChatScreenHome = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;
  const { width } = useWindowDimensions();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    Animated.timing(translateY, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <ScrollView contentContainerStyle={styles.chatContent}>
        <Filter />
        <Friend />
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  chatContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f99500',
    marginBottom: 8,
  },
  filterBox: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  friendBox: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
  },
  friendPlaceholder: {
    color: '#ccc',
    marginTop: 10,
    fontSize: 14,
  },
});

export default ChatScreenHome;
