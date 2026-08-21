// KIWI Mint - Wallet Connect + Chain Check
// Robinhood Chain: Chain ID 4663

const ROBINHOOD_CHAIN = {
  chainId: '0x1237', // 4663 in hex
  chainName: 'Robinhood Chain',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.mainnet.chain.robinhood.com'],
  blockExplorerUrls: ['https://robinhoodchain.blockscout.com'],
};

const CONTRACT_ADDRESS = '0x70f9b5f150bc8fff581a4886246589009eb6881f';
const CONTRACT_ABI = [
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
];

const OPENSEA_MINT_URL = 'https://opensea.io/collection/kiwi-291094080/mint';

let provider = null;
let signer = null;
let userAddress = null;
let contract = null;

const connectBtn = document.getElementById('connectBtn');
const mintPanel = document.getElementById('mintPanel');
const mintBtn = document.getElementById('mintBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const connectedAddr = document.getElementById('connectedAddr');
const mintedCount = document.getElementById('mintedCount');
const userMinted = document.getElementById('userMinted');
const mintMsg = document.getElementById('mintMsg');

function shortAddr(addr) {
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

function showMsg(text, type = 'info') {
  mintMsg.textContent = text;
  mintMsg.className = 'mint-msg mint-msg-' + type;
}

async function checkChain() {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId !== ROBINHOOD_CHAIN.chainId) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ROBINHOOD_CHAIN.chainId }],
      });
      return true;
    } catch (err) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ROBINHOOD_CHAIN],
          });
          return true;
        } catch (addErr) {
          showMsg('Please add Robinhood Chain to your wallet', 'error');
          return false;
        }
      }
      showMsg('Please switch to Robinhood Chain', 'error');
      return false;
    }
  }
  return true;
}

async function updateStats() {
  if (!contract) {
    mintedCount.textContent = '0';
    userMinted.textContent = '0';
    return;
  }
  try {
    const supply = await contract.totalSupply();
    mintedCount.textContent = supply.toString();
    const bal = await contract.balanceOf(userAddress);
    userMinted.textContent = bal.toString();
  } catch (e) {
    console.error(e);
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    showMsg('Wallet not detected. Install MetaMask or Bitget Wallet.', 'error');
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts.length) return;
    userAddress = accounts[0];

    const chainOK = await checkChain();
    if (!chainOK) return;

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    connectBtn.style.display = 'none';
    mintPanel.style.display = 'block';
    connectedAddr.textContent = shortAddr(userAddress);

    await updateStats();
    showMsg('Wallet connected', 'success');
  } catch (err) {
    console.error(err);
    showMsg(err.code === 4001 ? 'Connection rejected' : 'Failed to connect', 'error');
  }
}

function disconnectWallet() {
  provider = signer = userAddress = contract = null;
  connectBtn.style.display = 'inline-block';
  mintPanel.style.display = 'none';
  mintedCount.textContent = '-';
  userMinted.textContent = '0';
  showMsg('', 'info');
}

async function mint() {
  // Redirect ke OpenSea SeaDrop mint page
  window.open(OPENSEA_MINT_URL, '_blank');
}

connectBtn.addEventListener('click', connectWallet);
disconnectBtn.addEventListener('click', disconnectWallet);
mintBtn.addEventListener('click', mint);

if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (!accounts.length) disconnectWallet();
    else {
      userAddress = accounts[0];
      connectedAddr.textContent = shortAddr(userAddress);
      updateStats();
    }
  });
  window.ethereum.on('chainChanged', () => window.location.reload());
      }
