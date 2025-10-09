import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { ChatAppABI, ChatAppAddress } from "../Context/constants";

export const CheckIfWalletConnected = async () => {
    try {
        if (!window.ethereum) {
            throw new Error("Please install MetaMask");
        }
        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });
        return accounts[0];
    } catch (error) {
        console.error("Error checking wallet connection:", error);
        throw error;
    }
};

export const connectWallet = async () => {
    try {
        if (!window.ethereum) {
            throw new Error("Please install MetaMask");
        }
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        return accounts[0];
    } catch (error) {
        console.error("Error connecting wallet:", error);
        throw error;
    }
};

const fetchContract = (runner) =>
    new ethers.Contract(ChatAppAddress, ChatAppABI, runner);

export const connectingWithContract = async () => {
    try {
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        console.log("Connection:", connection);

        // For ethers v6, use BrowserProvider:
        const provider = new ethers.BrowserProvider(connection);
        const signer = await provider.getSigner();
        console.log("Signer Address:", await signer.getAddress());

        // Create the contract instance using the signer for transaction capabilities
        const contract = fetchContract(signer);
        return contract;
    } catch (error) {
        console.error("Error in connectingWithContract:", error);
        throw error;
    }
};
/*
export const converTime = (time) => {
    // Convert a BigNumber time to a formatted string
    const newTime = new Date(time.toNumber());
    const realTime = `${newTime.getHours()}:${newTime.getMinutes()}:${newTime.getSeconds()} on ${newTime.getDate()}/${newTime.getMonth() + 1
        }/${newTime.getFullYear()}`;
    return realTime;
};
*/
export const converTime = (time) => {
    try {
        // Convert BigInt to a number
        const newTime = new Date(Number(time) * 1000); // Multiply by 1000 if it's in seconds

        const realTime = `${newTime.getHours()}:${newTime.getMinutes()}:${newTime.getSeconds()} on ${newTime.getDate()}/${newTime.getMonth() + 1
            }/${newTime.getFullYear()}`;

        return realTime;
    } catch (error) {
        console.error("Error in converTime:", error);
        return "Invalid Time";
    }
};
