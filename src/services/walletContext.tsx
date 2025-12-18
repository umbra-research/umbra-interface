import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getSolBalance, formatAddress, getTokenBalance, Cluster } from './solana';

export interface WalletContextType {
  connected: boolean;
  publicKey: PublicKey | null;
  balance: number;
  balanceLoading: boolean;
  balanceError: string | null;
  refreshBalance: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode; cluster: Cluster }> = ({ children, cluster }) => {
  const { publicKey, connected, disconnect: adapterDisconnect } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const refreshBalance = async () => {
    if (!connected || !publicKey) {
      setBalance(0);
      return;
    }

    setBalanceLoading(true);
    setBalanceError(null);

    try {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / 1e9); // Convert lamports to SOL
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalanceError('Failed to fetch balance');
    } finally {
      setBalanceLoading(false);
    }
  };

  // Refresh balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
      // Poll balance every 10 seconds
      const interval = setInterval(refreshBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [connected, publicKey]);

  const handleDisconnect = async () => {
    setBalance(0);
    await adapterDisconnect();
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        publicKey,
        balance,
        balanceLoading,
        balanceError,
        refreshBalance,
        disconnect: handleDisconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within WalletProvider');
  }
  return context;
};
