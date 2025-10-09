import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';
import AllUserScreen from '../screens/AllUserScreen';
import ChatsScreen from '../screens/ChatsScreen';
import PendingRequestScreen from '../screens/PendingRequestScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import TotalPostScreen from '../screens/TotalPostScreen';
import AllPostScreen from '../screens/AllPostScreen';
import AllFriendPostScreen from '../screens/AllFriendPostScreen';
import NFTHomeScreen from '../screens/NftHomeScreen';
import CreateNFTScreen from '../screens/CreateNftScreen';
import MarketplaceScreen from '../screens/MarketScreen';
import MyNFTScreen from '../screens/MyNftScreen';
import ServicesScreen from '../screens/ServicesScreen';
import TokenScreen from '../screens/TokenScreen';
import UserCardScreen from '../screens/UserCardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import RewardsScreen from '../screens/RewardsScreen';
import GeneratePostScreen from '../screens/GeneratePostScreen';

import Navbar from '../Components/Navbar';

const Stack = createStackNavigator();
const TotalPostStack = createStackNavigator();
const NFTStack = createStackNavigator();
const ServicesStack = createStackNavigator();
const ProfileStack = createStackNavigator();

function TotalPostStackScreen() {
  return (
    <TotalPostStack.Navigator screenOptions={{ headerShown: false }}>
      <TotalPostStack.Screen name="TotalPost" component={TotalPostScreen} />
      <TotalPostStack.Screen name="AllPost" component={AllPostScreen} />
      <TotalPostStack.Screen name="FriendPost" component={AllFriendPostScreen} />
    </TotalPostStack.Navigator>
  );
}

function NFTStackScreen() {
  return (
    <NFTStack.Navigator screenOptions={{ headerShown: false }}>
      <NFTStack.Screen name="NFTHome" component={NFTHomeScreen} />
      <NFTStack.Screen name="CreateNFT" component={CreateNFTScreen} />
      <NFTStack.Screen name="Market" component={MarketplaceScreen} />
      <NFTStack.Screen name="MyNFT" component={MyNFTScreen} />
    </NFTStack.Navigator>
  );
}

function ServicesStackScreen() {
  return (
    <ServicesStack.Navigator screenOptions={{ headerShown: false }}>
      <ServicesStack.Screen name="Services" component={ServicesScreen} />
      <ServicesStack.Screen name="Tokens" component={TokenScreen} />
      <ServicesStack.Screen name="Rewards" component={RewardsScreen} />
    </ServicesStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
      <ProfileStack.Screen name="Achievements" component={AchievementsScreen} />
      <ProfileStack.Screen name="Rewards" component={RewardsScreen} />
    </ProfileStack.Navigator>
  );
}

const Navigation = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={({ navigation, route }) => ({
          header: () => <Navbar navigation={navigation} route={route} />,
          cardStyle: { backgroundColor: 'transparent' },
        })}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="AllUsers" component={AllUserScreen} />
        <Stack.Screen name="Chats" component={ChatsScreen} />
        <Stack.Screen name="PendingRequest" component={PendingRequestScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="UserCard" component={UserCardScreen} />
        <Stack.Screen name="GeneratePost" component={GeneratePostScreen} />

        {/* Nested Navigators */}
        <Stack.Screen name="TotalPostStack" component={TotalPostStackScreen} />
        <Stack.Screen name="NFTStack" component={NFTStackScreen} />
        <Stack.Screen name="ServicesStack" component={ServicesStackScreen} />
        <Stack.Screen name="ProfileStack" component={ProfileStackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
