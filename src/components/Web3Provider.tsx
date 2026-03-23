import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  isActive: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  chainId: null,
  isActive: false,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  error: null,
});

export const useWeb3 = () => useContext(Web3Context);

interface Props {
  children: ReactNode;
}

export const Web3Provider: React.FC<Props> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
        }
      } catch (err) {
        console.error("Error checking connection:", err);
      }
    }
  };

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });

      window.ethereum.on('chainChanged', (chainIdHex: string) => {
        setChainId(parseInt(chainIdHex, 16));
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      setError("MetaMask not found. Please install the extension.");
      return;
    }

    setIsConnecting(true);
    setError(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      const network = await provider.getNetwork();
      setChainId(Number(network.chainId));
    } catch (err: any) {
      console.error("Connection error:", err);
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setChainId(null);
  };

  return (
    <Web3Context.Provider value={{ 
      account, 
      chainId, 
      isActive: !!account, 
      isConnecting, 
      connect, 
      disconnect,
      error 
    }}>
      {children}
    </Web3Context.Provider>
  );
};
