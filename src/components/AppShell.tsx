'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { colors, space, radii, shadows, typography, motion } from '../theme';
import { useAppContext } from '../components/Providers';
import { Button } from './Button';
import { mockClusters } from '../mockData';
import { formatAddress } from '../services/solana';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { selectedCluster, setSelectedCluster } = useAppContext();
  const { connected, publicKey } = useWallet();
  const [showClusterMenu, setShowClusterMenu] = React.useState(false);

  const navItems = [
    { path: '/', label: 'Transfer', icon: '↗' }, 
    { path: '/inbox', label: 'Inbox', icon: '📥' }, 
    { path: '/activity', label: 'Activity', icon: '⚡' },
  ];

  const clusterLabel = mockClusters.find(c => c.name === selectedCluster)?.label || selectedCluster;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: colors.bg,
        color: colors.text,
        overflow: 'hidden'
      }}
    >
      {/* Top Bar (Floating Glass) */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: `${space.sm}px ${space.lg}px`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Brand */}
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          fontFamily: typography.h1.fontFamily, // Cinzel
          background: colors.accentGradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.02em',
        }}>
           UMBRA
        </div>

        {/* Cluster & Wallet */}
        <div style={{ display: 'flex', gap: `${space.md}px`, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowClusterMenu(!showClusterMenu)}
              style={{ fontSize: '12px', height: '32px' }}
            >
              <span style={{opacity: 0.7, marginRight: 4}}>Network:</span> {clusterLabel}
            </Button>
            {showClusterMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: `${space.sm}px`,
                  background: 'rgba(20, 20, 30, 0.9)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: radii.md,
                  overflow: 'hidden',
                  zIndex: 100,
                  width: '160px',
                  boxShadow: shadows.lg,
                  animation: 'fadeIn 0.2s',
                }}
              >
                {mockClusters.map(cluster => (
                  <button
                    key={cluster.name}
                    onClick={() => {
                      setSelectedCluster(cluster.name);
                      setShowClusterMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: `${space.md}px`,
                      background: selectedCluster === cluster.name ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                      color: selectedCluster === cluster.name ? colors.accent : colors.text,
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontFamily: typography.fontBody,
                      transition: motion.fast,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCluster !== cluster.name) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCluster !== cluster.name) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    {cluster.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              padding: `6px 12px`,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: radii.full,
              fontSize: '12px',
              fontFamily: typography.fontMono,
              color: colors.textSecondary,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? colors.success : colors.danger }} />
            {connected && publicKey ? formatAddress(publicKey.toString()) : 'Disconnected'}
          </div>

          <WalletMultiButton style={{
            background: colors.accentGradient,
            color: '#000',
            fontFamily: typography.fontBody,
            borderRadius: radii.full,
            height: '32px',
            fontSize: '13px',
            fontWeight: 600,
            padding: '0 16px',
            boxShadow: shadows.glowSm,
          }} />
          
           <Link
            href="/settings"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: pathname === '/settings' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
              color: pathname === '/settings' ? colors.accent : colors.textMuted,
              transition: motion.fast,
              fontSize: '16px',
            }}
          >
            ⚙
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: `${space.xl}px ${space.lg}px`, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </div>

      {/* Floating Bottom Nav (Mobile/Desktop Unified for modern feel) */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 40,
        }}
      >
        <div style={{
          display: 'flex',
          padding: '6px',
          background: 'rgba(20, 20, 20, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '999px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: shadows.lg,
          gap: '4px',
        }}>
          {navItems.map(item => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '999px',
                  textDecoration: 'none',
                  color: isActive ? '#000' : colors.textSecondary,
                  background: isActive ? colors.accentGradient : 'transparent',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  transition: motion.fast,
                  boxShadow: isActive ? shadows.glowSm : 'none',
                }}
              >
                <div style={{ fontSize: '16px' }}>
                  {item.icon}
                </div>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
