'use client';

import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-amber-50 selection:bg-amber-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(218,165,32,0.05),transparent_50%)]" />
         <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(138,50,250,0.05),transparent_50%)]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-amber-900/10 backdrop-blur-md bg-[#050505]/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 font-cinzel">
              UMBRA
            </span>
          </div>

          <div className="flex items-center gap-6">
             {mounted && <WalletMultiButton className="!bg-amber-900/20 !border !border-amber-500/20 !text-amber-100 hover:!bg-amber-900/40 !rounded-none !font-cinzel !transition-all" />}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-24 pb-12 max-w-7xl mx-auto px-6">
        {children}
      </main>
    </div>
  );
};
