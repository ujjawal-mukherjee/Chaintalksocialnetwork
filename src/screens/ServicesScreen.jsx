import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../Context/ThemeContext';

const { width } = Dimensions.get('window');

const ServicesScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const services = [
    {
      id: 1,
      title: 'View My Tokens',
      description: 'See the tokens you\'ve earned or bought on the platform.',
      icon: 'account-balance-wallet',
      screen: 'Tokens',
      color: '#6C5CE7'
    },
    {
      id: 2,
      title: 'Rewards',
      description: 'Check your rewards and achievements.',
      icon: 'stars',
      screen: 'Rewards',
      color: '#E17055'
    }
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Services</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Access all platform features
        </Text>
      </View>

      <View style={styles.servicesGrid}>
        {services.map((service) => (
          <Pressable
            key={service.id}
            style={[styles.serviceCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate(service.screen)}
          >
            <View style={[styles.iconContainer, { backgroundColor: service.color + '20' }]}>
              <MaterialIcons name={service.icon} size={32} color={service.color} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.heading, { color: colors.text }]}>{service.title}</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {service.description}
              </Text>
            </View>
            <MaterialIcons 
              name="chevron-right" 
              size={24} 
              color={colors.textSecondary} 
              style={styles.arrow}
            />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  servicesGrid: {
    padding: 16,
    gap: 16,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  arrow: {
    marginLeft: 8,
  },
});

export default ServicesScreen;
