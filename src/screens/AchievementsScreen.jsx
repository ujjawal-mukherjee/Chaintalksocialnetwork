import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../Context/ThemeContext';

const AchievementsScreen = () => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: 'Chat Master',
      description: 'Send 100 messages',
      icon: 'chat',
      progress: 75,
      total: 100,
      reward: 50,
      unlocked: false,
      category: 'messaging',
    },
    {
      id: 2,
      title: 'Social Butterfly',
      description: 'Add 10 friends',
      icon: 'people',
      progress: 8,
      total: 10,
      reward: 100,
      unlocked: false,
      category: 'social',
    },
    {
      id: 3,
      title: 'Early Adopter',
      description: 'Join during beta',
      icon: 'rocket-launch',
      progress: 100,
      total: 100,
      reward: 200,
      unlocked: true,
      category: 'special',
    },
    {
      id: 4,
      title: 'Night Owl',
      description: 'Send messages at night',
      icon: 'nightlight',
      progress: 3,
      total: 5,
      reward: 75,
      unlocked: false,
      category: 'time',
    },
    {
      id: 5,
      title: 'Message Marathon',
      description: 'Send 5 messages in 1 minute',
      icon: 'speed',
      progress: 100,
      total: 100,
      reward: 150,
      unlocked: true,
      category: 'speed',
    },
  ]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress bars
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, []);

  const getCategoryColor = (category) => {
    // Using theme colors for consistency
    switch (category) {
      case 'messaging':
        return colors.primary; 
      case 'social':
        return colors.secondary; 
      case 'special':
        return colors.error; // Using error color for special for contrast
      case 'time':
        return colors.textSecondary; // Using textSecondary for time-based for a softer look
      case 'speed':
        return colors.primary; 
      default:
        return colors.primary;
    }
  };

  const renderAchievement = (achievement, index) => {
    const categoryColor = getCategoryColor(achievement.category);
    const progress = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, achievement.progress],
    });

    return (
      <Animated.View
        key={achievement.id}
        style={[
          styles.achievementCard,
          {
            backgroundColor: colors.surface,
            opacity: fadeAnim,
            transform: [{ translateY }],
            borderColor: colors.border, // Added border
            borderWidth: 1, // Added border
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: `rgba(${parseInt(categoryColor.slice(1,3), 16)}, ${parseInt(categoryColor.slice(3,5), 16)}, ${parseInt(categoryColor.slice(5,7), 16)}, 0.15)` }]}> {/* Use rgba for transparency */}
          <MaterialIcons name={achievement.icon} size={32} color={categoryColor} />
        </View>
        <View style={styles.achievementContent}>
          <View style={styles.achievementHeader}>
            <Text style={[styles.achievementTitle, { color: colors.text }]}>
              {achievement.title}
            </Text>
            <View style={[styles.rewardBadge, { backgroundColor: `rgba(${parseInt(categoryColor.slice(1,3), 16)}, ${parseInt(categoryColor.slice(3,5), 16)}, ${parseInt(categoryColor.slice(5,7), 16)}, 0.15)` }]}> {/* Use rgba for transparency */}
              <MaterialIcons name="stars" size={16} color={categoryColor} />
              <Text style={[styles.rewardText, { color: categoryColor }]}>
                {achievement.reward}
              </Text>
            </View>
          </View>
          <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>
            {achievement.description}
          </Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBackground, { backgroundColor: `rgba(${parseInt(colors.textSecondary.slice(1,3), 16)}, ${parseInt(colors.textSecondary.slice(3,5), 16)}, ${parseInt(colors.textSecondary.slice(5,7), 16)}, 0.2)` }]}> {/* Use rgba for transparency */}
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: categoryColor,
                    width: progress.interpolate({
                      inputRange: [0, achievement.total],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {achievement.progress}/{achievement.total}
            </Text>
          </View>
        </View>
        {achievement.unlocked && (
          <View style={[styles.unlockedBadge, { backgroundColor: categoryColor }]}>
            <MaterialIcons name="check" size={20} color={colors.buttonText} /> {/* Adjusted icon color */}
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            opacity: fadeAnim,
            transform: [{ translateY }],
            borderColor: colors.border, // Added border
            borderBottomWidth: 1, // Added border
          },
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Achievements</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Complete tasks to earn rewards
          </Text>
        </View>
        <View style={[styles.statsContainer, { backgroundColor: `rgba(${parseInt(colors.primary.slice(1,3), 16)}, ${parseInt(colors.primary.slice(3,5), 16)}, ${parseInt(colors.primary.slice(5,7), 16)}, 0.15)` }]}> {/* Use rgba for transparency */}
          <MaterialIcons name="stars" size={24} color={colors.primary} />
          <Text style={[styles.statsText, { color: colors.primary }]}>
            {achievements.filter(a => a.unlocked).length}/{achievements.length}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.achievementsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.achievementsListContent}
      >
        {achievements.map((achievement, index) => renderAchievement(achievement, index))}
      </ScrollView>
    </View>
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
    padding: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
  },
  statsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementsList: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  achievementsListContent: {
    paddingBottom: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
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
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  achievementDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  unlockedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AchievementsScreen; 