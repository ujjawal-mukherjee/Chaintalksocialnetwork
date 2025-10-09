import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Dimensions } from 'react-native';

const AboutScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

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
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY }] }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>About ChatApp</Text>
        <Text style={styles.paragraph}>
          ChatApp is a fast, secure, and user-friendly messaging platform designed to keep you connected with your friends and family.
          Whether you're sending text messages, making video calls, or sharing media, ChatApp ensures a smooth and private communication experience.
        </Text>

        <Text style={styles.heading}>Why Choose ChatApp?</Text>
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>🔐 End-to-End Encryption</Text>
            <Text style={styles.featureDesc}>Your messages and calls are completely private.</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>📹 Seamless Video Calls</Text>
            <Text style={styles.featureDesc}>High-quality video and audio for uninterrupted conversations.</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>💬 Instant Messaging</Text>
            <Text style={styles.featureDesc}>Send texts, images, and documents in real-time.</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>💻 Cross-Platform Support</Text>
            <Text style={styles.featureDesc}>Available on mobile, web, and desktop.</Text>
          </View>
        </View>

        <Text style={styles.heading}>Stay Connected, Anytime, Anywhere</Text>
        <Text style={styles.paragraph}>
          ChatApp is built for the modern world, helping people communicate without boundaries.
          Whether you're chatting with a close friend or collaborating with a team, our platform makes communication effortless and enjoyable.
        </Text>
      </ScrollView>
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f9a826',
    textAlign: 'center',
    marginVertical: 20,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  paragraph: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    maxWidth: 800,
    marginBottom: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    width: width / 2 - 30,
    margin: 8,
    alignItems: 'center',
  },
  featureTitle: {
    color: '#f9a826',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 14,
    color: '#eee',
    textAlign: 'center',
  },
});

export default AboutScreen;
