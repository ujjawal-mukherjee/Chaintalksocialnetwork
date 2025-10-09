import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { CheckIfWalletConnected, connectWallet } from "../Utils/apiFeatures";
import { ChatAppAddress, ChatAppABI } from "./constants";

export const chatAppContext = createContext();

export const ChatAppProvider = ({ children }) => {
    const title = "Hey welcome to blockchain";

    // State declarations
    const [account, setAccount] = useState("");
    const [username, setUsername] = useState("");
    const [friendLists, setFriendLists] = useState([]);
    const [friendMsg, setFriendMsg] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userList, setUserList] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [error, setError] = useState("");
    const [currentUserName, setCurrentUserName] = useState("");
    const [currentUserAddress, setCurrentUserAddress] = useState("");
    const [myPosts, setMyPosts] = useState([]);
    const [friendsPosts, setFriendsPosts] = useState([]);
    const [allNFTs, setAllNFTs] = useState([]);
    const [myNFTs, setMyNFTs] = useState([]);
    const [myRewardTokens, setMyRewardTokens] = useState("0");

    // Get Ethereum provider
    const getProvider = () => {
        if (!window.ethereum) {
            throw new Error("No Ethereum provider found. Please install MetaMask.");
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        provider.resolveName = async () => null; // Disable ENS resolution
        return provider;
    };

    // Wallet connection with retry logic
    const connectWalletWithRetry = async (retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                setLoading(true);
                const address = await connectWallet();
                if (!address) throw new Error("No accounts found");
                setAccount(address);
                return address;
            } catch (err) {
                console.error(`Attempt ${i + 1} failed:`, err);
                if (i < retries - 1) await new Promise((resolve) => setTimeout(resolve, delay));
            } finally {
                setLoading(false);
            }
        }
        setError("Failed to connect wallet after multiple attempts");
        return null;
    };

    // Fetch data with validation
    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const connectAccount = await connectWalletWithRetry();
            if (!connectAccount) throw new Error("Wallet not connected");

            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            // Fetch username
            const userName = await contract.getUsername(connectAccount);
            if (userName && userName !== "0x") {
                setUsername(userName);
                setCurrentUserName(userName);
                setCurrentUserAddress(connectAccount);
            }

            // Fetch all users with validation
            const allUsers = await contract.getAllAppUser();
            if (!Array.isArray(allUsers)) {
                throw new Error("Invalid user list format");
            }
            const userArray = allUsers.map((user) => ({
                name: user.name || "",
                accountAddress: user.accountAddress || user.pubkey || "",
                imageHash: user.imageHash || "",
            }));
            setUserList(userArray);

            // Fetch friend-related data
            const [friends, pendingReqs, sentReqs] = await Promise.all([
                contract.getMyFriendList(),
                contract.getMyPendingRequests(),
                contract.getMySentRequests(),
            ]);

            setFriendLists(friends.map((f) => ({
                name: f.name || "",
                pubkey: f.pubkey || "",
                imageHash: f.imageHash || "",
            })));
            setPendingRequests(pendingReqs.map((r) => r.toLowerCase()));
            setSentRequests(sentReqs.map((r) => r.toLowerCase()));

            // Fetch additional data
            await Promise.all([fetchAllNFTs(), fetchMyNFTs(), fetchMyRewards()]);
        } catch (err) {
            console.error("Error in fetchData:", err);
            setError(err.message || "Failed to fetch data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Filter available users
    useEffect(() => {
        if (!account || !userList.length) return;
        const friendAddresses = friendLists.map((f) => f.pubkey.toLowerCase());
        const pendingAddresses = pendingRequests.map((a) => a.toLowerCase());
        const sentAddresses = sentRequests.map((a) => a.toLowerCase());

        const filtered = userList.filter(
            (user) =>
                user.accountAddress.toLowerCase() !== account.toLowerCase() &&
                !friendAddresses.includes(user.accountAddress.toLowerCase()) &&
                !pendingAddresses.includes(user.accountAddress.toLowerCase()) &&
                !sentAddresses.includes(user.accountAddress.toLowerCase())
        );
        setAvailableUsers(filtered);
    }, [account, userList, friendLists, pendingRequests, sentRequests]);

    // Initialize app on mount
    useEffect(() => {
        const initializeApp = async () => {
            try {
                const isConnected = await CheckIfWalletConnected();
                if (isConnected) {
                    await fetchData();
                }
            } catch (err) {
                console.error("Error initializing app:", err);
                setError("Failed to initialize app");
            }
        };
        initializeApp();

        // Cleanup event listeners
        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners("accountsChanged");
                window.ethereum.removeAllListeners("chainChanged");
            }
        };
    }, []);

    // Account creation
    const createAccount = async ({ name, physicalAddress, imageHash }) => {
        try {
            setLoading(true);
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const tx = await contract.createAccount(name, physicalAddress, imageHash);
            await tx.wait();

            await new Promise((resolve) => setTimeout(resolve, 3000));

            const updatedUserName = await contract.getUsername(account);
            if (!updatedUserName || updatedUserName === "0x") {
                throw new Error("User not created or empty data returned.");
            }

            setUsername(updatedUserName);
            setCurrentUserName(updatedUserName);
            setCurrentUserAddress(account);
            setUserList(await contract.getAllAppUser());
        } catch (err) {
            console.error("Error creating account:", err);
            setError("Error in creating account: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Friend request functions
    const sendFriendRequest = async (friendAddress) => {
        try {
            if (!ethers.isAddress(friendAddress)) {
                throw new Error("Invalid friend address");
            }
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const tx = await contract.sendFriendRequest(friendAddress);
            setLoading(true);
            await tx.wait();
            setSentRequests([...sentRequests, friendAddress.toLowerCase()]);
        } catch (err) {
            console.error("Error sending friend request:", err);
            setError("Error in sending friend request: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const acceptFriendRequest = async (friendAddress) => {
        try {
            if (!ethers.isAddress(friendAddress)) {
                throw new Error("Invalid friend address");
            }
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const tx = await contract.acceptFriendRequest(friendAddress);
            setLoading(true);
            await tx.wait();
            setFriendLists([...friendLists, { pubkey: friendAddress, name: "", imageHash: "" }]);
            setPendingRequests(pendingRequests.filter((r) => r.toLowerCase() !== friendAddress.toLowerCase()));
        } catch (err) {
            console.error("Error accepting friend request:", err);
            setError("Error in accepting friend request: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const rejectFriendRequest = async (fromAddress) => {
        try {
            if (!ethers.isAddress(fromAddress)) {
                throw new Error("Invalid address");
            }
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const tx = await contract.rejectFriendRequest(fromAddress);
            await tx.wait();
            setPendingRequests(pendingRequests.filter((r) => r.toLowerCase() !== fromAddress.toLowerCase()));
        } catch (err) {
            console.error("Error rejecting friend request:", err);
            setError("Error in rejecting friend request: " + err.message);
        }
    };

    // Messaging functions
    const sendMessage = async ({ msg, address }) => {
        try {
            if (!msg.trim() || !ethers.isAddress(address)) {
                throw new Error("Message and valid address are required");
            }
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            setLoading(true);
            const tx = await contract.sendMessage(address, msg.trim());
            await tx.wait();
            await readMessage(address);
        } catch (err) {
            console.error("Error sending message:", err);
            setError("Error in sending message: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const readMessage = async (friendAddress) => {
        try {
            if (!ethers.isAddress(friendAddress)) {
                throw new Error("Invalid friend address");
            }
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const messages = await contract.readMessage(friendAddress);
            const validMessages = Array.isArray(messages)
                ? [...messages] // Create a mutable copy of the array
                    .filter((msg) => msg && msg.sender && msg.msg && msg.timestamp)
                    .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
                : [];
            setFriendMsg(validMessages);
        } catch (err) {
            console.error("Error reading messages:", err);
            setError("No messages found: " + err.message);
            setFriendMsg([]);
        }
    };

    const checkMessages = async (friendAddress) => {
        try {
            if (!ethers.isAddress(friendAddress)) return false;
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const messages = await contract.readMessage(friendAddress);
            return Array.isArray(messages) && messages.length > 0;
        } catch (err) {
            console.error("Error checking messages:", err);
            return false;
        }
    };

    const readUser = async (userAddress) => {
        try {
            if (!ethers.isAddress(userAddress)) {
                throw new Error("Invalid user address");
            }
            const provider = getProvider();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, provider);

            const userName = await contract.getUsername(userAddress);
            setCurrentUserName(userName);
            setCurrentUserAddress(userAddress);
        } catch (err) {
            console.error("Error fetching user details:", err);
            setError("Unable to fetch user details: " + err.message);
        }
    };

    // Post functions
    const createPost = async (content, imageHash) => {
        try {
            if (!content.trim()) {
                throw new Error("Post content cannot be empty");
            }
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const tx = await contract.createPost(content, imageHash || "");
            setLoading(true);
            await tx.wait();
            await fetchMyPosts();
        } catch (err) {
            console.error("Error creating post:", err);
            setError("Error in creating post: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyPosts = async () => {
        try {
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            if (!(await contract.checkUserExists(await signer.getAddress()))) {
                throw new Error("User not registered. Please create an account.");
            }

            const posts = await contract.getMyPosts();
            setMyPosts(Array.isArray(posts) ? posts : []);
        } catch (err) {
            console.error("Error fetching my posts:", err);
            setError("Error fetching my posts: " + err.message);
        }
    };

    const fetchFriendsPosts = async () => {
        try {
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            if (!(await contract.checkUserExists(await signer.getAddress()))) {
                throw new Error("User not registered. Please create an account.");
            }

            const posts = await contract.getFriendsPosts();
            setFriendsPosts(Array.isArray(posts) ? posts : []);
        } catch (err) {
            console.error("Error fetching friends' posts:", err);
            setError("Error fetching friends' posts: " + err.message);
        }
    };

    const likePost = async (friendAddress, postId) => {
        try {
            if (!ethers.isAddress(friendAddress) || !Number.isInteger(Number(postId))) {
                throw new Error("Invalid friend address or post ID");
            }
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const tx = await contract.likePost(friendAddress, postId);
            setLoading(true);
            await tx.wait();
            await fetchFriendsPosts();
        } catch (err) {
            console.error("Error liking post:", err);
            setError("Error in liking post: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const commentOnPost = async (friendAddress, postId, commentText) => {
        try {
            if (!ethers.isAddress(friendAddress) || !Number.isInteger(Number(postId)) || !commentText.trim()) {
                throw new Error("Invalid friend address, post ID, or comment text");
            }
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const tx = await contract.commentOnPost(friendAddress, postId, commentText);
            setLoading(true);
            await tx.wait();
            await fetchFriendsPosts();
        } catch (err) {
            console.error("Error commenting on post:", err);
            setError("Error in commenting on post: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // NFT functions
    const createNFT = async (title, price, description, originalHash, previewHash) => {
        try {
            if (!title.trim() || !ethers.parseEther(price.toString()) || !description.trim()) {
                throw new Error("Invalid NFT details");
            }
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const tx = await contract.addNFT(title, price, description, originalHash || "", previewHash || "");
            setLoading(true);
            await tx.wait();
            await Promise.all([fetchAllNFTs(), fetchMyNFTs()]);
        } catch (err) {
            console.error("Error creating NFT:", err);
            setError("Error in creating NFT: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllNFTs = async () => {
        try {
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const nfts = await contract.getAllNFTs();
            setAllNFTs(Array.isArray(nfts) ? nfts : []);
        } catch (err) {
            console.error("Error fetching all NFTs:", err);
            setError("Error fetching NFTs: " + err.message);
        }
    };

    const fetchMyNFTs = async () => {
        try {
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            console.log('Fetching my NFTs...');
            const nfts = await contract.getMyNFTs();
            console.log('Raw NFTs from contract:', nfts);

            const formattedNFTs = Array.isArray(nfts) ? nfts : [];
            console.log('Formatted NFTs:', formattedNFTs);

            setMyNFTs(formattedNFTs);
        } catch (err) {
            console.error("Error fetching my NFTs:", err);
            setError("Error fetching my NFTs: " + err.message);
        }
    };

    const buyNFT = async (tokenId, price) => {
        try {
            if (!Number.isInteger(Number(tokenId)) || !ethers.parseEther(price.toString())) {
                throw new Error("Invalid token ID or price");
            }
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const tx = await contract.buyNFT(tokenId, { value: ethers.parseEther(price.toString()) });
            setLoading(true);
            await tx.wait();
            await Promise.all([fetchAllNFTs(), fetchMyNFTs()]);
        } catch (err) {
            console.error("Error buying NFT:", err);
            setError("Error in buying NFT: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRewards = async () => {
        try {
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(ChatAppAddress, ChatAppABI, signer);

            const reward = await contract.getMyRewards();
            setMyRewardTokens(reward.toString());
        } catch (err) {
            console.error("Failed to fetch rewards:", err);
            setError("Unable to fetch your rewards: " + err.message);
        }
    };

    useEffect(() => {
        if (account) setCurrentUserAddress(account);
    }, [account]);

    return (
        <chatAppContext.Provider
            value={{
                title,
                account,
                username,
                friendLists,
                friendMsg,
                loading,
                error,
                currentUserName,
                currentUserAddress,
                userList,
                pendingRequests,
                sentRequests,
                availableUsers,
                CheckIfWalletConnected,
                connectWallet: connectWalletWithRetry,
                readMessage,
                createAccount,
                sendFriendRequest,
                acceptFriendRequest,
                rejectFriendRequest,
                sendMessage,
                checkMessages,
                readUser,
                createPost,
                fetchMyPosts,
                fetchFriendsPosts,
                likePost,
                commentOnPost,
                myPosts,
                friendsPosts,
                createNFT,
                fetchAllNFTs,
                fetchMyNFTs,
                buyNFT,
                allNFTs,
                myNFTs,
                fetchMyRewards,
                myRewardTokens,
                setAccount
            }}
        >
            {children}
        </chatAppContext.Provider>
    );
};