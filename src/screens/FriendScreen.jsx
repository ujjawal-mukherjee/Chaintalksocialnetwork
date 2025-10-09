import React, { useContext, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import Card from './Card/Card';
import Chat from '../Chat/Chat';
import { chatAppContext } from '../Context/ChatAppContext';

const FriendScreen = () => {
    const {
        sendMessage,
        friendMsg,
        account,
        friendLists,
        readMessage,
        username,
        loading,
        currentUserName,
        currentUserAddress,
        readUser,
    } = useContext(chatAppContext);

    const [selectedFriend, setSelectedFriend] = useState(null);

    const handleFriendSelect = (friend) => {
        setSelectedFriend(friend);
    };

    return (
        <View style={styles.container}>
            <View style={styles.friendList}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {friendLists.map((el, i) => (
                        <Card
                            key={i}
                            el={el}
                            i={i}
                            readMessage={readMessage}
                            readUser={readUser}
                            onSelect={() => handleFriendSelect(el)}
                        />
                    ))}
                </ScrollView>
            </View>

            <View style={styles.chatContainer}>
                {selectedFriend ? (
                    <Chat
                        functionName={sendMessage}
                        friendMsg={friendMsg}
                        account={account}
                        username={username}
                        loading={loading}
                        currentUserName={currentUserName}
                        currentUserAddress={currentUserAddress}
                        selectedFriend={selectedFriend}
                        readMessage={readMessage}
                    />
                ) : (
                    <View style={styles.placeholderTextWrapper}>
                        <Text style={styles.placeholderText}>Select a friend to start chatting</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: screenWidth > 768 ? 'row' : 'column',
        padding: 10,
        backgroundColor: '#000',
    },
    friendList: {
        flex: screenWidth > 768 ? 1.4 : 1,
        marginBottom: screenWidth > 768 ? 0 : 20,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    chatContainer: {
        flex: screenWidth > 768 ? 3 : 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 10,
        overflow: 'hidden',
    },
    placeholderTextWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#fff',
        fontSize: 18,
        opacity: 0.7,
    },
});

export default FriendScreen;
