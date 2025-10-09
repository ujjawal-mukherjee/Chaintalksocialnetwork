export const ChatAppAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const ChatAppABI = [
  "function getAllUsers() view returns (tuple(string name, address accountAddress, string imageHash)[])",
  "function getFriends() view returns (tuple(string name, address accountAddress, string imageHash)[])",
  "function getPendingRequests() view returns (tuple(string name, address accountAddress, string imageHash)[])",
  "function getSentRequests() view returns (tuple(string name, address accountAddress, string imageHash)[])",
  "function sendFriendRequest(address _friend) external",
  "function acceptFriendRequest(address _friend) external",
  "function rejectFriendRequest(address _friend) external",
  "function sendMessage(address _friend, string _msg) external",
  "function readMessage(address _friend) view returns (tuple(address sender, string msg, uint256 timestamp)[])",
  "function checkUserExists(address _user) view returns (bool)",
  "function getUsername(address _user) view returns (string)",
  "function createAccount(string _name, string _imageHash) external"
];

export const NFTAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const NFTABI = [
  "function mintNFT(string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId) public"
];

export const TokenAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
export const TokenABI = [
  "function mint(address to, uint256 amount) public",
  "function balanceOf(address account) public view returns (uint256)",
  "function transfer(address to, uint256 amount) public returns (bool)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) public returns (bool)"
]; 