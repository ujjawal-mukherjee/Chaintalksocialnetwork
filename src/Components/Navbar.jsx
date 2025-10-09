import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  Animated,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { chatAppContext } from '../Context/ChatAppContext';
import { useTheme } from '../Context/ThemeContext';
import ModelScreen from '../screens/ModelScreen';
import ErrorMessage from './ErrorMessage';
import images from '../assets';
import { MaterialIcons } from '@expo/vector-icons';
import { connectWallet } from '../Utils/apiFeatures';

const menuItems = [
  { menu: 'Home', path: 'Home' },
  { menu: 'Add-Friends', path: 'AllUsers' },
  { menu: 'Requests', path: 'PendingRequest' },
  { menu: 'Messenger', path: 'Chats' },
  { menu: 'Create Post', path: 'CreatePost' },
  { menu: 'Posts', path: 'TotalPostStack' },
  { menu: 'NFT-Market', path: 'NFTStack' },
  { menu: 'Services', path: 'ServicesStack' },
];

const Navbar = ({ navigation, route }) => {
  const {
    account,
    userName,
    userImage,
    createAccount,
    error,
    currentUserName,
    setAccount, // Added setAccount from context
  } = useContext(chatAppContext);
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [openModel, setOpenModel] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [activeItem, setActiveItem] = useState(route?.name);
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const handleProfilePress = () => {
    navigation.navigate('ProfileStack', {
      screen: 'ProfileMain'
    });
  };

  const handleNavigation = (path) => {
    setActiveItem(path);
    navigation.navigate(path);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    Animated.spring(slideAnim, {
      toValue: menuOpen ? -300 : 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  // Handle wallet connection and update account state
  const handleConnectWallet = async () => {
    try {
      const connectedAccount = await connectWallet();
      if (connectedAccount) {
        setAccount(connectedAccount); // Update the account state in context
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
      }
    ]}>
      <View style={[styles.innerContainer, isMobile && { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <View style={styles.logoContainer}>
          <Image source={images.avatar1} style={styles.logo} resizeMode="contain" />
        </View>

        {isMobile ? (
          <TouchableOpacity
            onPress={toggleMenu}
            style={[styles.menuButton, { backgroundColor: colors.surface }]}
          >
            <MaterialIcons
              name={menuOpen ? 'close' : 'menu'}
              size={28}
              color={colors.text}
            />
          </TouchableOpacity>
        ) : null}

        {!isMobile ? (
          <ScrollView
            horizontal
            contentContainerStyle={styles.menuContainer}
            showsHorizontalScrollIndicator={false}
          >
            {menuItems.map((el, i) => {
              const isActive = activeItem === el.path;
              const isHovered = hoveredItem === i;

              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleNavigation(el.path)}
                  onMouseEnter={() => Platform.OS === 'web' && setHoveredItem(i)}
                  onMouseLeave={() => Platform.OS === 'web' && setHoveredItem(null)}
                  style={[
                    styles.menuItemContainer,
                    {
                      backgroundColor: isActive
                        ? colors.activeBackground
                        : isHovered
                          ? colors.hoverBackground
                          : 'transparent',
                    }
                  ]}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      {
                        color: isActive
                          ? colors.buttonText
                          : isHovered
                            ? colors.primary
                            : colors.text,
                      }
                    ]}
                  >
                    {el.menu}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <Modal
            visible={menuOpen}
            transparent
            animationType="none"
            onRequestClose={toggleMenu}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={toggleMenu}
            >
              <Animated.View
                style={[
                  styles.mobileMenu,
                  {
                    backgroundColor: colors.surface,
                    transform: [{ translateX: slideAnim }],
                  }
                ]}
              >
                <ScrollView style={styles.mobileMenuScroll}>
                  {menuItems.map((el, i) => {
                    const isActive = activeItem === el.path;
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => { handleNavigation(el.path); toggleMenu(); }}
                        style={[
                          styles.mobileMenuItem,
                          {
                            backgroundColor: isActive ? colors.activeBackground : 'transparent',
                          }
                        ]}
                      >
                        <Text
                          style={[
                            styles.mobileMenuItemText,
                            {
                              color: isActive ? colors.primary : colors.text,
                            }
                          ]}
                        >
                          {el.menu}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Animated.View>
            </TouchableOpacity>
          </Modal>
        )}

        {!isMobile && (
          <View style={styles.walletContainer}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.themeButton, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.themeButtonText, { color: colors.text }]}>
                {isDarkMode ? '☀️' : '🌙'}
              </Text>
            </TouchableOpacity>

            {!account ? (
              <TouchableOpacity
                onPress={handleConnectWallet} // Updated to use new handler
                style={[styles.button, styles.connectButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>Connect Wallet</Text>
              </TouchableOpacity>
            ) : !currentUserName ? (
              <TouchableOpacity
                onPress={() => setOpenModel(true)}
                style={[styles.button, styles.createAccountButton, {
                  backgroundColor: colors.surface,
                }]}
              >
                <Image source={images.create2} style={styles.avatar} />
                <Text style={[styles.buttonText, { color: colors.text }]}>Create Account</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.userContainer, {
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.primary + '40',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }]}
                onPress={handleProfilePress}
              >
                <Image
                  source={{ uri: userImage || 'https://via.placeholder.com/150' }}
                  style={[styles.avatar, { borderColor: colors.primary }]}
                />
                <Text style={[styles.username, { color: colors.text }]}>
                  {currentUserName || 'Anonymous'}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
        {isMobile && (
          <View style={[styles.walletContainer, { width: '100%', marginTop: 10, justifyContent: 'flex-start' }]}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.themeButton, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.themeButtonText, { color: colors.text }]}>
                {isDarkMode ? '☀️' : '🌙'}
              </Text>
            </TouchableOpacity>

            {!account ? (
              <TouchableOpacity
                onPress={handleConnectWallet} // Updated to use new handler
                style={[styles.button, styles.connectButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.buttonText, { color: colors.buttonText }]}>Connect Wallet</Text>
              </TouchableOpacity>
            ) : !currentUserName ? (
              <TouchableOpacity
                onPress={() => setOpenModel(true)}
                style={[styles.button, styles.createAccountButton, {
                  backgroundColor: colors.surface,
                }]}
              >
                <Image source={images.create2} style={styles.avatar} />
                <Text style={[styles.buttonText, { color: colors.text }]}>Create Account</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.userContainer, {
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.primary + '40',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }]}
                onPress={handleProfilePress}
              >
                <Image
                  source={{ uri: userImage || 'https://via.placeholder.com/150' }}
                  style={[styles.avatar, { borderColor: colors.primary }]}
                />
                <Text style={[styles.username, { color: colors.text }]}>
                  {currentUserName || 'Anonymous'}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {openModel && (
        <View style={[
          styles.modal,
        ]}>
          <ModelScreen
            openBox={setOpenModel}
            title="WELCOME TO"
            head="CHAT BUDDY"
            info="This is a chat app where you can communicate in a decentralized and secure way."
            smallInfo="Kindly select your name..."
            images={images}
            functionName={createAccount}
            address={account}
          />
        </View>
      )}

      {error && <ErrorMessage error={error} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    width: '100%',
    backdropFilter: 'blur(10px)',
    borderBottomWidth: 1,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    maxWidth: 1400,
    marginHorizontal: 'auto',
  },
  logoContainer: {
    borderRadius: 12,
    padding: 8,
  },
  logo: {
    width: 40,
    height: 40,
  },
  menuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  menuItemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    transition: 'all 0.2s ease',
    minWidth: 80,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    transition: 'all 0.2s ease',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 0 : 10,
    gap: 12,
  },
  themeButton: {
    padding: 8,
    borderRadius: 8,
  },
  themeButtonText: {
    fontSize: 18,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.3s ease',
  },
  connectButton: {
    // No specific background here, as it's applied inline
  },
  createAccountButton: {
    borderWidth: 1,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 8,
    transition: 'all 0.3s ease',
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
  },
  modelContent: {
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 500,
  },
  errorMessageContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 80 : 100,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  errorMessageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeErrorButton: {
    position: 'absolute',
    right: 10,
    padding: 5,
  },
  closeErrorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  mobileMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 300,
    paddingTop: Platform.OS === 'web' ? 80 : 100,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
  },
  mobileMenuScroll: {
    flex: 1,
  },
  mobileMenuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  mobileMenuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Navbar;