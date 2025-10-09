import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../Context/ThemeContext';

const BottomTabs = ({ navigation, route }) => {
  const { colors } = useTheme();

  const tabs = [
    {
      name: 'Home',
      icon: 'home',
      route: 'Home'
    },
    {
      name: 'Chats',
      icon: 'chat',
      route: 'Chats'
    },
    {
      name: 'Friends',
      icon: 'people',
      route: 'AllUsers'
    },
    {
      name: 'Posts',
      icon: 'article',
      route: 'TotalPostStack'
    },
    {
      name: 'Profile',
      icon: 'person',
      route: 'ProfileStack'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {tabs.map((tab, index) => {
        const isActive = route.name === tab.route;
        return (
          <TouchableOpacity
            key={index}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.route)}
          >
            <MaterialIcons
              name={tab.icon}
              size={24}
              color={isActive ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default BottomTabs; 