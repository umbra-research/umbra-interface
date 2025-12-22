'use client';

import React, { useState, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { mockWalletState, WalletState, Cluster } from '../mockData';
import { RPC_ENDPOINTS } from '../services/solana';

// Import wallet context styles
import '@solana/wallet-adapter-react-ui/styles.css';

export interface AppContextType {
  wallet: WalletState;
  setWallet: (state: WalletState) => void;
  selectedCluster: Cluster;
  setSelectedCluster: (cluster: Cluster) => void;
  showUI: boolean;
  setShowUI: (visible: boolean) => void;
}

export const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(mockWalletState);
  const [selectedCluster, setSelectedCluster] = useState<Cluster>('localnet');
  const [showUI, setShowUI] = useState(true);

  // Setup wallet adapters
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  const endpoint = useMemo(() => RPC_ENDPOINTS[selectedCluster], [selectedCluster]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContext.Provider value={{ wallet, setWallet, selectedCluster, setSelectedCluster, showUI, setShowUI }}>
            {children}
          </AppContext.Provider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
