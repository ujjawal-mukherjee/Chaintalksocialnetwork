import React, { useState, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, Modal } from 'react-native';
import { chatAppContext } from '../Context/ChatAppContext';
import Model from '../Model/Model';
import images from '../assets';

const FilterScreen = () => {
  const { account, addFriends } = useContext(chatAppContext);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Image source={images.search} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search..."
          placeholderTextColor="#aaa"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setShowAddFriendModal(true)}>
          <Image source={images.user} style={styles.icon} />
          <Text style={styles.buttonText}>Add Friend</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]}>
          <Text style={styles.buttonText}>Clear Chat</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showAddFriendModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddFriendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Model
            openBox={setShowAddFriendModal}
            title="WELCOME TO"
            head="CHAT BUDDY"
            info="HEY WELCOME TO CHATAPP CHAT WITH YOUR FAMILY AND FRIENDS"
            smallInfo="Kindly provide your and your friend's name"
            images={images}
            functionName={addFriends}
            address={account}
          />
        </View>
      </Modal>
    </View>
  );
};

export default FilterScreen;

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 25,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: '#fff',
    fontSize: 16,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 69, 69, 0.3)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});