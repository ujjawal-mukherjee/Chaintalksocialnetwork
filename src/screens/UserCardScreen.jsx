import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Dimensions, Modal, SafeAreaView } from 'react-native';
import { chatAppContext } from '../Context/ChatAppContext';
import { useTheme } from '../Context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const UserCardScreen = ({ el, onClose }) => {
  const { sendFriendRequest, userImages } = useContext(chatAppContext);
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);

  const name = el[0];
  const accountAddress = el[1];
  const jsonHash = el[2];

  useEffect(() => {
    if (userImages[accountAddress]) {
      setLoading(false);
    }
  }, [userImages, accountAddress]);

  const handleSendRequest = () => {
    sendFriendRequest(accountAddress);
    Alert.alert('Request Sent', `Friend request sent to ${name}`);
    if (onClose) onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalOverlay}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>User Profile</Text>
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.imageWrapper}>
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <Image
                  source={{ uri: userImages[accountAddress] || 'https://via.placeholder.com/100' }}
                  style={[styles.image, { borderColor: colors.border }]}
                  onError={() => console.log('Image failed to load')}
                />
              )}
            </View>
            <View style={styles.infoBox}>
              <Text style={[styles.name, { color: colors.primary }]}>{name}</Text>
              <Text style={[styles.address, { color: colors.textSecondary }]}>{accountAddress.slice(0, 25)}...</Text>
              <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.primary }] /* Changed background to primary */}
                onPress={handleSendRequest}
              >
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', /* Slightly darker overlay */
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    // Removed padding to give more control to inner elements
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, /* Increased shadow offset */
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    position: 'relative',
    marginVertical: 20,
    overflow: 'hidden',
    borderWidth: 1, /* Added a subtle border */
    borderColor: 'rgba(0, 0, 0, 0.1)', /* Light border color */
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, /* Thinner border */
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 20, /* Slightly larger title */
    fontWeight: 'bold',
    // Removed color here, let parent determine
  },
  closeButton: {
    width: 36, /* Slightly smaller button */
    height: 36,
    borderRadius: 18, /* Adjust for new size */
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)', /* Lighter background */
    marginLeft: 10,
  },
  imageWrapper: {
    marginVertical: 24, /* Increased vertical margin */
    alignItems: 'center',
  },
  image: {
    width: 130, /* Slightly larger image */
    height: 130,
    borderRadius: 65, /* Adjust for new size */
    borderWidth: 4, /* Thicker border */
  },
  infoBox: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24, /* Increased horizontal padding */
    paddingBottom: 24, /* Increased bottom padding */
  },
  name: {
    fontSize: 24, /* Larger name font */
    fontWeight: 'bold',
    marginBottom: 8, /* Increased margin */
    textAlign: 'center',
  },
  address: {
    fontSize: 15, /* Slightly larger address font */
    marginBottom: 20, /* Increased margin */
    textAlign: 'center',
  },
  button: {
    paddingVertical: 14, /* Increased padding */
    paddingHorizontal: 28, /* Increased padding */
    borderRadius: 30, /* More rounded corners */
    marginTop: 12, /* Increased top margin */
    width: '90%', /* Wider button */
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17, /* Slightly larger text */
    fontWeight: 'bold',
  },
});

export default UserCardScreen;
