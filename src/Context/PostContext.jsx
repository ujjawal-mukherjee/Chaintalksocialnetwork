const fetchMyPosts = async () => {
  try {
    // First check if wallet is connected
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    }).catch((err) => {
      if (err.code === 4001) {
        // User rejected the connection
        throw new Error('Please connect your wallet to view your posts');
      } else {
        throw new Error('Failed to connect wallet: ' + err.message);
      }
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No wallet accounts found');
    }

    const userAddress = accounts[0];
    // Continue with your existing post fetching logic
    // ... existing code ...
  } catch (error) {
    console.error('Error fetching my posts:', error);
    throw error; // Re-throw to handle in the UI
  }
}; 