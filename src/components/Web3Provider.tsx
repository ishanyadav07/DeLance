import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  balance: string | null;
  usdcBalance: string | null;
  chainId: string | null;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex
const USDC_ADDRESS = import.meta.env.VITE_USDC_ADDRESS;
const ERC20_ABI = ["function balanceOf(address account) public view returns (uint256)", "function decimals() view returns (uint8)"];

const Web3Context = createContext<Web3ContextType>({
  account: null,
  balance: null,
  usdcBalance: null,
  chainId: null,
  isCorrectNetwork: false,
  connectWallet: async () => {},
  loading: true,
  error: null,
});

export const useWeb3 = () => useContext(Web3Context);

interface Props {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Props) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateBalance = async (address: string) => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // ETH Balance
      const bal = await provider.getBalance(address);
      setBalance(ethers.formatEther(bal));

      // USDC Balance
      if (USDC_ADDRESS) {
        try {
          const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
          const [rawBalance, decimals] = await Promise.all([
            usdcContract.balanceOf(address),
            usdcContract.decimals().catch(() => 6)
          ]);
          setUsdcBalance(ethers.formatUnits(rawBalance, decimals));
        } catch (usdcErr) {
          console.warn('Error fetching USDC balance:', usdcErr);
          setUsdcBalance('0.00');
        }
      }
    } catch (err) {
      console.error('Error updating balance:', err);
    }
  };

  const checkNetwork = (id: string | null) => {
    setIsCorrectNetwork(id === SEPOLIA_CHAIN_ID);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      await updateBalance(accounts[0]);
      
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(currentChainId);
      checkNetwork(currentChainId);
      
      setError(null);
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            await updateBalance(accounts[0]);
          }
          
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(currentChainId);
          checkNetwork(currentChainId);
        } catch (err) {
          console.error('Error initializing Web3:', err);
        }
      }
      setLoading(false);
    };

    init();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
        if (accounts[0]) {
          updateBalance(accounts[0]);
        } else {
          setBalance(null);
        }
      });

      window.ethereum.on('chainChanged', (id: string) => {
        setChainId(id);
        checkNetwork(id);
        if (account) {
          updateBalance(account);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <Web3Context.Provider value={{ account, balance, usdcBalance, chainId, isCorrectNetwork, connectWallet, loading, error }}>
      {children}
    </Web3Context.Provider>
  );
};
