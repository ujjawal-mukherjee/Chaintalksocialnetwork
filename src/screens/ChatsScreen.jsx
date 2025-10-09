import React, { useContext, useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Platform,
    Image,
    Animated,
    Dimensions,
    Modal,
    Keyboard,
    useWindowDimensions,
} from "react-native";
import { chatAppContext } from "../Context/ChatAppContext";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../Context/ThemeContext";
import { LinearGradient } from 'expo-linear-gradient';
import EmojiSelector, { Categories } from 'react-native-emoji-selector';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ChatsScreen = () => {
    const {
        friendLists,
        friendMsg,
        sendMessage,
        readMessage,
        checkMessages,
        loading,
        error,
    } = useContext(chatAppContext);
    const { colors } = useTheme();
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [message, setMessage] = useState("");
    const [hasMessages, setHasMessages] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const navigation = useNavigation();
    
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const typingAnim = useRef(new Animated.Value(0)).current;

    const { width } = useWindowDimensions();
    const isMobile = width < 600;
    const [showFriendList, setShowFriendList] = useState(true);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        if (selectedFriend) {
            readMessage(selectedFriend.pubkey);
            checkMessages(selectedFriend.pubkey).then(setHasMessages);
        }
    }, [selectedFriend, readMessage, checkMessages]);

    useEffect(() => {
        if (isMobile && selectedFriend) {
            setShowFriendList(false);
        } else if (!selectedFriend) {
            setShowFriendList(true);
        }
    }, [isMobile, selectedFriend]);

    const handleSend = async () => {
        if (!selectedFriend) {
            alert("Please select a friend to chat with");
            return;
        }

        if (!message.trim()) {
            alert("Message cannot be empty");
            return;
        }

        try {
            await sendMessage({
                msg: message,
                address: selectedFriend.pubkey,
            });
            setMessage("");
            setShowEmojiPicker(false);
        } catch (err) {
            alert(err.message || "Failed to send message");
        }
    };

    const handleEmojiSelected = (emoji) => {
        setMessage(prev => prev + emoji);
    };

    const handleAttachment = async (type) => {
        try {
            let result;
            if (type === 'image') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    alert('Sorry, we need camera roll permissions to make this work!');
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    quality: 1,
                    allowsEditing: true,
                });
                if (!result.canceled) {
                    // Handle image attachment
                    console.log('Image selected:', result.assets[0].uri);
                    // Here you would typically upload the image and send the message
                    // For now, we'll just show a success message
                    alert('Image selected successfully!');
                }
            } else if (type === 'document') {
                result = await DocumentPicker.getDocumentAsync({
                    type: '*/*',
                    copyToCacheDirectory: true,
                });
                if (result.type === 'success') {
                    // Handle document attachment
                    console.log('Document selected:', result.uri);
                    // Here you would typically upload the document and send the message
                    // For now, we'll just show a success message
                    alert('Document selected successfully!');
                }
            }
        } catch (err) {
            console.error('Error picking file:', err);
            alert('Error selecting file. Please try again.');
        }
        setShowAttachmentOptions(false);
    };

    const renderMessage = (msg, index) => {
        if (!msg || !msg.msg || !msg.sender) return null;

        const isSender = msg.sender.toLowerCase() === selectedFriend?.pubkey.toLowerCase();
        return (
            <Animated.View
                key={index}
                style={[
                    styles.messageBubble,
                    isSender ? styles.receivedMessage : styles.sentMessage,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim }
                        ]
                    }
                ]}
            >
                <Text style={styles.messageText}>{msg.msg}</Text>
                <View style={styles.messageFooter}>
                    <Text style={styles.timestamp}>
                        {new Date(Number(msg.timestamp) * 1000).toLocaleTimeString()}
                    </Text>
                    {!isSender && (
                        <MaterialIcons name="done-all" size={16} color="rgba(255,255,255,0.6)" />
                    )}
                </View>
            </Animated.View>
        );
    };

    const formatAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const renderAttachmentOptions = () => (
        <Modal
            visible={showAttachmentOptions}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAttachmentOptions(false)}
        >
            <TouchableOpacity 
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowAttachmentOptions(false)}
            >
                <View style={[styles.attachmentOptions, { backgroundColor: colors.card }]}>
                    <TouchableOpacity 
                        style={styles.attachmentOption}
                        onPress={() => handleAttachment('image')}
                    >
                        <MaterialIcons name="image" size={24} color={colors.primary} />
                        <Text style={[styles.attachmentOptionText, { color: colors.text }]}>Image</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.attachmentOption}
                        onPress={() => handleAttachment('document')}
                    >
                        <MaterialIcons name="insert-drive-file" size={24} color={colors.primary} />
                        <Text style={[styles.attachmentOptionText, { color: colors.text }]}>Document</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    // Dark theme color scheme
    const customColors = {
        primary: '#BB86FC', // Light purple
        secondary: '#3700B3', // Deep purple
        accent: '#03DAC6', // Teal accent
        background: '#121212', // Dark background
        card: '#1E1E1E', // Dark card
        text: '#FFFFFF', // White text
        textSecondary: '#B3B3B3', // Secondary text
        error: '#CF6679', // Error red
        success: '#00E676', // Success green
        warning: '#FFD600', // Warning yellow
        messageSent: '#BB86FC', // Message sent color
        messageReceived: '#2D2D2D', // Message received color
        messageText: '#FFFFFF', // Message text color
        messageTextLight: '#FFFFFF', // Light message text
        border: 'rgba(255,255,255,0.1)', // Border color
        shadow: 'rgba(0,0,0,0.3)', // Shadow color
        inputBackground: '#2D2D2D', // Input background
        headerGradient: ['#1E1E1E', '#121212'], // Header gradient
    };

    return (
        <View style={[styles.container, { backgroundColor: customColors.background }]}>
            <LinearGradient
                colors={customColors.headerGradient}
                style={styles.header}
            >
                {isMobile && selectedFriend && (
                <TouchableOpacity
                        onPress={() => setSelectedFriend(null)}
                    style={styles.backButton}
                >
                    <MaterialIcons name="arrow-back" size={24} color={customColors.text} />
                </TouchableOpacity>
                )}
                <Text style={[styles.headerTitle, { color: customColors.text }]}>Chats</Text>
            </LinearGradient>

            <View style={[styles.content, { flexDirection: isMobile ? 'column' : 'row' }]}>
                {(!isMobile || showFriendList) && (
                <Animated.View 
                    style={[
                        styles.friendList,
                        { 
                            backgroundColor: customColors.card,
                            opacity: fadeAnim,
                            transform: [
                                { translateX: slideAnim },
                                { scale: scaleAnim }
                                ],
                                width: isMobile ? '100%' : SCREEN_WIDTH * 0.3,
                                height: isMobile ? (selectedFriend ? 0 : undefined) : '100%',
                                display: isMobile && selectedFriend ? 'none' : 'flex',
                        }
                    ]}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {friendLists.length === 0 ? (
                            <View style={styles.emptyStateContainer}>
                                <MaterialIcons name="people" size={64} color={customColors.primary} />
                                <Text style={[styles.emptyText, { color: customColors.textSecondary }]}>
                                    No friends yet
                                </Text>
                            </View>
                        ) : (
                            friendLists.map((friend, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.friendItem,
                                        selectedFriend?.pubkey === friend.pubkey && styles.selectedFriend,
                                    ]}
                                    onPress={() => setSelectedFriend(friend)}
                                >
                                    <LinearGradient
                                        colors={[customColors.primary, customColors.secondary]}
                                        style={styles.friendAvatar}
                                    >
                                        <MaterialIcons name="person" size={24} color={customColors.text} />
                                    </LinearGradient>
                                    <View style={styles.friendInfo}>
                                        <Text style={[styles.friendName, { color: customColors.text }]}>
                                            {friend.name || formatAddress(friend.pubkey)}
                                        </Text>
                                        <View style={styles.statusContainer}>
                                            <View style={[styles.statusDot, { backgroundColor: customColors.primary }]} />
                                            <Text style={[styles.friendStatus, { color: customColors.textSecondary }]}>
                                                Online
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </Animated.View>
                )}

                <View style={[
                    styles.chatArea,
                    { backgroundColor: customColors.background, width: isMobile ? '100%' : undefined }
                ]}>
                    {selectedFriend && (
                        <View style={[styles.chatHeader, { backgroundColor: customColors.card }]}>
                            <View style={styles.chatHeaderInfo}>
                                <Text style={[styles.chatHeaderName, { color: customColors.text }]}>
                                    {selectedFriend.name || formatAddress(selectedFriend.pubkey)}
                                </Text>
                                <Text style={[styles.chatHeaderStatus, { color: customColors.textSecondary }]}>
                                    Online
                                </Text>
                            </View>
                            <View style={styles.chatHeaderActions}>
                                <TouchableOpacity style={styles.chatHeaderButton}>
                                    <MaterialIcons name="videocam" size={24} color={customColors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.chatHeaderButton}>
                                    <MaterialIcons name="call" size={24} color={customColors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.chatHeaderButton}>
                                    <MaterialIcons name="more-vert" size={24} color={customColors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={customColors.primary} />
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
                            <MaterialIcons name="error-outline" size={64} color={customColors.error} />
                            <Text style={[styles.errorText, { color: customColors.error }]}>{error}</Text>
                        </View>
                    ) : !selectedFriend ? (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="chat" size={80} color={customColors.primary} />
                            <Text style={[styles.emptyText, { color: customColors.textSecondary }]}>
                                Select a friend to start chatting
                            </Text>
                        </View>
                    ) : !hasMessages ? (
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="chat-bubble-outline" size={80} color={customColors.primary} />
                            <Text style={[styles.emptyText, { color: customColors.textSecondary }]}>
                                No messages yet. Start the conversation!
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            style={styles.messageList}
                            contentContainerStyle={{ paddingBottom: 16 }}
                            ref={(ref) => {
                                if (ref) ref.scrollToEnd({ animated: true });
                            }}
                        >
                            {friendMsg.map(renderMessage)}
                            {isTyping && (
                                <View style={styles.typingIndicator}>
                                    <Text style={[styles.typingText, { color: customColors.textSecondary }]}>
                                        Typing
                                    </Text>
                                    <Animated.View style={[styles.typingDots, { opacity: typingAnim }]}>
                                        <Text style={{ color: customColors.primary }}>...</Text>
                                    </Animated.View>
                                </View>
                            )}
                        </ScrollView>
                    )}

                    {selectedFriend && (
                        <Animated.View 
                            style={[
                                styles.inputContainer,
                                { 
                                    backgroundColor: customColors.card,
                                    opacity: fadeAnim,
                                    transform: [
                                        { translateY: slideAnim },
                                        { scale: scaleAnim }
                                    ]
                                }
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.emojiButton}
                                onPress={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <MaterialIcons name="emoji-emotions" size={24} color={customColors.primary} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={styles.attachmentButton}
                                onPress={() => setShowAttachmentOptions(true)}
                            >
                                <MaterialIcons name="attach-file" size={24} color={customColors.primary} />
                            </TouchableOpacity>

                            <TextInput
                                style={[styles.input, { 
                                    backgroundColor: customColors.inputBackground,
                                    color: customColors.text,
                                }]}
                                value={message}
                                onChangeText={(text) => {
                                    setMessage(text);
                                    setIsTyping(true);
                                    setTimeout(() => setIsTyping(false), 2000);
                                }}
                                placeholder="Type a message..."
                                placeholderTextColor={customColors.textSecondary}
                                maxLength={500}
                                multiline
                            />
                            
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    { backgroundColor: message.trim() ? customColors.primary : customColors.textSecondary },
                                ]}
                                onPress={handleSend}
                                disabled={loading || !message.trim()}
                            >
                                <MaterialIcons
                                    name="send"
                                    size={24}
                                    color={customColors.text}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {showEmojiPicker && (
                        <View style={[styles.emojiPicker, { backgroundColor: customColors.card }]}>
                            <EmojiSelector
                                onEmojiSelected={handleEmojiSelected}
                                showSearchBar={false}
                                showHistory={true}
                                columns={8}
                                theme={customColors.background}
                                category={Categories.all}
                            />
                        </View>
                    )}

                    {renderAttachmentOptions()}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 48 : 16,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    content: {
        flex: 1,
        flexDirection: "row",
    },
    friendList: {
        width: SCREEN_WIDTH * 0.3,
        borderRightWidth: 1,
        borderRightColor: "rgba(0,0,0,0.1)",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    friendItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.1)",
    },
    selectedFriend: {
        backgroundColor: "rgba(0,0,0,0.05)",
    },
    friendAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    friendInfo: {
        flex: 1,
    },
    friendName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    friendStatus: {
        fontSize: 12,
    },
    chatArea: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.1)",
    },
    chatHeaderInfo: {
        flex: 1,
    },
    chatHeaderName: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
    },
    chatHeaderStatus: {
        fontSize: 14,
    },
    chatHeaderActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    chatHeaderButton: {
        padding: 8,
        marginLeft: 8,
    },
    messageList: {
        flex: 1,
        padding: 16,
    },
    messageBubble: {
        maxWidth: "80%",
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    sentMessage: {
        backgroundColor: '#BB86FC', // Primary color
        alignSelf: "flex-end",
        borderBottomRightRadius: 4,
    },
    receivedMessage: {
        backgroundColor: '#2D2D2D', // Dark background
        alignSelf: "flex-start",
        borderBottomLeftRadius: 4,
    },
    messageText: {
        color: '#FFFFFF', // White text
        fontSize: 16,
        lineHeight: 22,
    },
    messageTextLight: {
        color: '#FFFFFF', // White text
    },
    messageFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: 4,
    },
    timestamp: {
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: 10,
        marginRight: 4,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    emojiButton: {
        padding: 8,
        marginRight: 8,
    },
    attachmentButton: {
        padding: 8,
        marginRight: 8,
    },
    input: {
        flex: 1,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginRight: 12,
        maxHeight: 120,
        fontSize: 16,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    emojiPicker: {
        height: 250,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    attachmentOptions: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 12,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    attachmentOption: {
        alignItems: "center",
        marginHorizontal: 16,
    },
    attachmentOptionText: {
        marginTop: 8,
        fontSize: 14,
    },
    typingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        marginTop: 8,
    },
    typingText: {
        fontSize: 14,
        marginRight: 4,
    },
    typingDots: {
        flexDirection: "row",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    errorText: {
        marginTop: 16,
        textAlign: "center",
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    emptyText: {
        marginTop: 24,
        textAlign: "center",
        fontSize: 18,
        lineHeight: 24,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
});

export default ChatsScreen;