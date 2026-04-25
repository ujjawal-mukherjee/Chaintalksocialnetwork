# 🌐 Web3 Social Media Platform

A **decentralized social media platform** powered by **React Native**, **Expo**, and **Web3**. It features NFT integration, real-time chat, token rewards, social engagement, and much more.

Contract Deployed To sepolia Testnet.

🚀 **Live Demo**: https://chaintalksocialnetwork-e7gf.vercel.app/

---

## 📌 Key Features

### 1. 🏠 Home Page
- Dynamic overview of trending posts and NFTs  
- Prompt to log in or create a Web3-connected account  
- Clean, responsive layout  
<img src="https://github.com/user-attachments/assets/d490d925-2501-496e-9df4-2a9a51ab7c0c" width="80%" />

---

### 2. 🆕 Create Account (Web3 Login)
- Support for MetaMask and WalletConnect  
- Automatic profile creation linked to your wallet  
- Secure session persistence  
<img src="https://github.com/user-attachments/assets/6f59832d-50f9-4da6-afa1-69aa348daebc" width="80%" />

---

### 3. 🧑‍🤝‍🧑 Add Friends
- Discover users via suggestions or search  
- Send friend requests directly from profiles  
<img src="https://github.com/user-attachments/assets/d55be86f-4256-4d89-ad3f-0f2206eaf02f" width="80%" />

---

### 4. 🔔 Friend Requests
- View incoming and outgoing requests  
- Easily accept or reject connections  
<img src="https://github.com/user-attachments/assets/b29fee77-a7ff-4a6f-a6e3-f1fe6927980b" width="80%" />

---

### 5. 💬 Messenger (Real-time Chat)
- One-on-one and group messaging  
- Send files, emojis, stickers, and message reactions  
- Real-time online presence and delivery/read receipts  
<img src="https://github.com/user-attachments/assets/09ceb0b3-a6d6-4e0d-83ed-c1d423c54ff3" width="80%" />
<img src="https://github.com/user-attachments/assets/37800a34-380b-4040-8e11-4cae9e7d89f8" width="80%" />

---

### 6. 📝 Create Post
- Leverage AI-assisted text creation and media uploads  
- Format posts richly, schedule them, or save drafts  
<img src="https://github.com/user-attachments/assets/165b2adc-bd11-4956-8d4e-2f2853947753" width="80%" />

<img src="https://github.com/user-attachments/assets/5d86708c-ae3d-4f66-baf9-0518f40a96e2" width="80%" />

---

### 7. 👀 View Posts & Feed
- Browse personal, friends’, and global feeds  
- Infinite scroll with likes, comments, shares, and reposts  
<img src="https://github.com/user-attachments/assets/00946170-4502-41bf-9f1a-7234085732f2" width="80%" />
<img src="https://github.com/user-attachments/assets/70d619a7-3d8f-4247-b414-26c240dc6c12" width="80%" />
<img src="https://github.com/user-attachments/assets/9a4ec238-9fe3-4126-bf7b-261273d3f59e" width="80%" />

---

### 8. 🎨 NFT Marketplace
- Mint NFTs with metadata, set royalties, preview content.
- Discover and bid on NFTs with filtering and stats.
- Automated Payment meathod through smart contarct.
- Authenticated owner of the NFT.
<img src="https://github.com/user-attachments/assets/0a922d44-fce5-452a-a136-860dc1eb537b" width="80%" />
<img src="https://github.com/user-attachments/assets/9dc0baa6-a83d-4710-97d7-29b515c39a25" width="80%" />
<img src="https://github.com/user-attachments/assets/89395827-e373-4815-a504-4c8894e2828a" width="80%" />
<img src="https://github.com/user-attachments/assets/f6066c92-d7b6-47d4-9db3-c071437703c5" width="80%" />

---

### 9. 🪙 Token System
- View portfolio, send tokens, and check transaction history  
- Earn tokens from engagement; view leaderboards and achievements  
<img src="https://github.com/user-attachments/assets/52072ea2-e3bd-4a3f-8997-6ec9cbdb77d2" width="80%" />
<img src="https://github.com/user-attachments/assets/2919ab45-de28-4ef7-923b-7d93669eeb59" width="80%" />

---

### 10. 👤 User Profile
- Showcase achievements, NFTs, and activity  
- Customize appearance and privacy settings  
<img src="https://github.com/user-attachments/assets/21008a36-b8da-455f-98ab-00ce3d786cd8" width="80%" />

---

### 11. 🔔 Notifications
- Real-time alerts for posts, messages, and NFT activity  
- Manage read/unread status and filter by type

---

## 🧰 Tech Stack

### Frontend
- React Native, Expo  
- React Navigation, Gesture Handler

### Web3 Integration
- ethers.js, WalletConnect, Web3Modal

### Libraries & Tools
- Axios, date-fns, AsyncStorage  
- Expo Image & Document Picker  
- React Native Vector Icons

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v14+  
- npm or yarn  
- Expo CLI  
- MetaMask or WalletConnect-compatible wallet


   ## Project Structure

```
src/
├── Components/     # Reusable UI components
├── screens/        # Application screens
│   ├── AllFriendPostScreen.jsx
│   ├── AllUserScreen.jsx
│   ├── ChatsScreen.jsx
│   ├── CreateNftScreen.jsx
│   ├── GeneratePostScreen.jsx
│   ├── HomeScreen.jsx
│   ├── MarketScreen.jsx
│   ├── ProfileScreen.jsx
│   └── ...
├── Backend/        # Backend services
├── Context/        # React Context providers
├── contracts/      # Smart contract integration
├── navigation/     # Navigation configuration
├── Utils/          # Utility functions
├── assets/         # Static assets
└── test/          # Test files
```


