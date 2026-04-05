import React from 'react';
import { ExternalLink, AlertCircle, Info } from 'lucide-react';

export enum Web3ErrorType {
  USER_REJECTED = 'USER_REJECTED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  WRONG_NETWORK = 'WRONG_NETWORK',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
  UNKNOWN = 'UNKNOWN'
}

export interface Web3ErrorInfo {
  type: Web3ErrorType;
  message: string;
  advice: React.ReactNode;
}

export const parseWeb3Error = (error: any): Web3ErrorInfo => {
  const errorString = (error?.message || error?.reason || String(error)).toLowerCase();
  
  // User Rejected
  if (
    errorString.includes('user rejected') || 
    errorString.includes('user denied') || 
    error?.code === 4001 ||
    error?.code === 'ACTION_REJECTED'
  ) {
    return {
      type: Web3ErrorType.USER_REJECTED,
      message: 'Transaction Rejected',
      advice: (
        <div className="space-y-2">
          <p>You cancelled the transaction in your wallet.</p>
          <p className="text-[10px] opacity-70">If this was a mistake, please try again and click "Confirm" in MetaMask.</p>
        </div>
      )
    };
  }

  // Insufficient Funds
  if (
    errorString.includes('insufficient funds') || 
    errorString.includes('exceeds balance') ||
    error?.code === 'INSUFFICIENT_FUNDS'
  ) {
    return {
      type: Web3ErrorType.INSUFFICIENT_FUNDS,
      message: 'Insufficient Funds',
      advice: (
        <div className="space-y-3">
          <p>You don't have enough Sepolia ETH to cover the gas fees for this transaction.</p>
          <div className="p-3 bg-surface-container rounded-lg border border-white/5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-2">
              <Info size={10} /> How to get funds
            </p>
            <div className="flex flex-col gap-2">
              <a 
                href="https://sepolia-faucet.pk910.de/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold"
              >
                1. Sepolia PoW Faucet <ExternalLink size={10} />
              </a>
              <a 
                href="https://faucet.quicknode.com/ethereum/sepolia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold"
              >
                2. QuickNode Faucet <ExternalLink size={10} />
              </a>
            </div>
          </div>
        </div>
      )
    };
  }

  // Wrong Network
  if (
    errorString.includes('wrong network') || 
    errorString.includes('chainid') ||
    errorString.includes('network mismatch')
  ) {
    return {
      type: Web3ErrorType.WRONG_NETWORK,
      message: 'Incorrect Network',
      advice: (
        <div className="space-y-2">
          <p>Your wallet is connected to the wrong blockchain network.</p>
          <p className="text-[10px] opacity-70">Please open MetaMask and switch your network to <b>Sepolia Testnet</b>.</p>
        </div>
      )
    };
  }

  // Contract Not Found
  if (
    errorString.includes('not a smart contract') || 
    errorString.includes('contract not found') ||
    errorString.includes('call_exception')
  ) {
    return {
      type: Web3ErrorType.CONTRACT_NOT_FOUND,
      message: 'Contract Not Found',
      advice: (
        <div className="space-y-3">
          <p>The smart contract could not be found on the current network.</p>
          <div className="p-3 bg-surface-container rounded-lg border border-white/5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Troubleshooting</p>
            <ul className="text-[10px] space-y-1 list-disc pl-4 opacity-80">
              <li>Ensure you are on <b>Sepolia Testnet</b>.</li>
              <li>Verify that <b>VITE_CONTRACT_ADDRESS</b> is correctly set in your Secrets.</li>
              <li>If you just deployed, wait a few seconds for the network to sync.</li>
            </ul>
          </div>
        </div>
      )
    };
  }

  // Generic Transaction Failure
  return {
    type: Web3ErrorType.UNKNOWN,
    message: 'Transaction Failed',
    advice: (
      <div className="space-y-2">
        <p>{error?.reason || error?.message || 'An unexpected error occurred during the blockchain transaction.'}</p>
        <p className="text-[10px] opacity-70">Try refreshing the page or checking your internet connection.</p>
      </div>
    )
  };
};

export const Web3ErrorDisplay: React.FC<{ error: any }> = ({ error }) => {
  if (!error) return null;
  const info = parseWeb3Error(error);

  return (
    <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex flex-col gap-3 text-error text-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <AlertCircle size={18} className="shrink-0" />
        <h4 className="font-bold uppercase tracking-widest text-[11px]">{info.message}</h4>
      </div>
      <div className="ml-7 text-xs leading-relaxed text-on-surface-variant">
        {info.advice}
      </div>
    </div>
  );
};
