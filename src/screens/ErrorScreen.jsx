import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const ErrorScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/564/564619.png' }}
        style={styles.icon}
      />
      <Text style={styles.title}>Oops! Something went wrong.</Text>
      <Text style={styles.message}>Please check your internet connection or try again later.</Text>
    </View>
  );
};

export default ErrorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    tintColor: '#ff5c5c',
  },
  title: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
});
