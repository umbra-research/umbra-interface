'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { colors, space, radii, typography, motion } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useSyncEngine } from '../../hooks/useSyncEngine';

interface WalletTx {
  signature: string;
  status: 'confirmed' | 'finalized' | 'failed';
  timestamp: Date | null;
  fee: number;
  slot?: number;
}

type ActivitySource = 'all' | 'stealth' | 'wallet';

export default function ActivityPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();

  // Tabs
  const [source, setSource] = useState<ActivitySource>('all');

  // Wallet transactions
  const [walletTxs, setWalletTxs] = useState<WalletTx[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(false);

  // Stealth data
  const [identity, setIdentity] = useState<any>(null);
  const userId = publicKey?.toBase58() || null;
  const viewSecret = identity?.viewSecret || null;
  const { ownedItems } = useSyncEngine(viewSecret, userId);

  // Load identity
  useEffect(() => {
    if (!connected || !publicKey) { setIdentity(null); return; }
    const stored = localStorage.getItem(`umbra_identity_${publicKey.toBase58()}`);
    if (stored) {
      try { setIdentity(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [connected, publicKey]);

  // Fetch wallet transactions
  const fetchWalletTxs = useCallback(async () => {
    if (!publicKey) return;
    setLoadingWallet(true);
    try {
      const sigs = await connection.getSignaturesForAddress(publicKey, { limit: 20 });
      const txs: WalletTx[] = sigs.map(sig => ({
        signature: sig.signature,
        status: sig.err ? 'failed' : sig.confirmationStatus === 'finalized' ? 'finalized' : 'confirmed',
        timestamp: sig.blockTime ? new Date(sig.blockTime * 1000) : null,
        fee: 5000, // lamports, approximate
        slot: sig.slot,
      }));
      setWalletTxs(txs);
    } catch (e) {
      console.error('Failed to fetch wallet transactions:', e);
    } finally {
      setLoadingWallet(false);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (connected && publicKey) fetchWalletTxs();
  }, [connected, publicKey, fetchWalletTxs]);

  // ── Not Connected ──
  if (!connected) {
    return (
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: `${space.xxl}px ${space.lg}px`, textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: `${space.lg}px` }}>📊</div>
        <h1 style={{ ...typography.h2, color: colors.text, marginBottom: `${space.md}px` }}>Activity</h1>
        <p style={{ ...typography.bodySm, color: colors.textSecondary, marginBottom: `${space.xl}px` }}>
          Connect your wallet to view transaction history
        </p>
        <Button variant="primary" onClick={() => setVisible(true)}>Connect Wallet</Button>
      </div>
    );
  }

  // Build combined activity feed
  const stealthActivity = ownedItems.map(item => ({
    type: 'stealth' as const,
    id: item.id,
    label: item.plaintext || 'Stealth Payment',
    status: item.status === 'Pending' ? 'claimable' : 'claimed',
    timestamp: new Date(item.timestamp),
    signature: item.signature,
    payer: item.payer,
  }));

  const walletActivity = walletTxs.map(tx => ({
    type: 'wallet' as const,
    id: tx.signature.slice(0, 16),
    label: 'Wallet Transaction',
    status: tx.status,
    timestamp: tx.timestamp,
    signature: tx.signature,
    payer: null,
    fee: tx.fee,
  }));

  const allActivity = [...stealthActivity, ...walletActivity]
    .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));

  const displayItems = source === 'stealth' ? stealthActivity :
                        source === 'wallet' ? walletActivity : allActivity;

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: `${space.md}px ${space.md}px ${space.huge}px` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: `${space.lg}px` }}>
        <div>
          <h1 style={{ ...typography.h2, color: colors.text, marginBottom: '2px' }}>Activity</h1>
          <p style={{ fontSize: '13px', color: colors.textSecondary }}>
            {stealthActivity.length} stealth · {walletActivity.length} on-chain
          </p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={fetchWalletTxs}
          disabled={loadingWallet}
        >
          {loadingWallet ? '⟳...' : '↻ Refresh'}
        </Button>
      </div>

      {/* Source Tabs */}
      <div style={{
        display: 'flex',
        gap: '2px',
        marginBottom: `${space.md}px`,
        background: colors.surface,
        borderRadius: radii.md,
        padding: '3px',
        border: `1px solid ${colors.border}`,
      }}>
        {[
          { key: 'all' as const, label: 'All' },
          { key: 'stealth' as const, label: `Stealth (${stealthActivity.length})` },
          { key: 'wallet' as const, label: `On-chain (${walletActivity.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSource(tab.key)}
            style={{
              flex: 1,
              padding: `${space.sm}px`,
              borderRadius: `calc(${radii.md} - 3px)`,
              background: source === tab.key ? colors.surface3 : 'transparent',
              border: 'none',
              color: source === tab.key ? colors.text : colors.textMuted,
              fontSize: '12px',
              fontWeight: source === tab.key ? '600' : '400',
              cursor: 'pointer',
              transition: motion.fast,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loadingWallet && source !== 'stealth' && (
        <div style={{
          padding: `${space.sm}px ${space.md}px`,
          background: colors.infoLight,
          borderRadius: radii.sm,
          border: `1px solid ${colors.info}20`,
          fontSize: '12px',
          color: colors.info,
          textAlign: 'center',
          marginBottom: `${space.md}px`,
        }}>
          ⟳ Fetching on-chain transactions...
        </div>
      )}

      {/* Empty State */}
      {displayItems.length === 0 && !loadingWallet && (
        <Card style={{ textAlign: 'center', padding: `${space.xxl}px ${space.lg}px` }}>
          <div style={{ fontSize: '40px', marginBottom: `${space.md}px` }}>📭</div>
          <div style={{ fontSize: '14px', color: colors.textSecondary }}>No activity found</div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: `${space.xs}px` }}>
            Send or receive a transaction to get started
          </div>
        </Card>
      )}

      {/* Activity Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.sm}px` }}>
        {displayItems.map((item, idx) => (
          <Card key={item.id ?? idx} hoverable>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px' }}>
                    {item.type === 'stealth' ? '🛡️' : '💳'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: colors.text }}>
                    {item.label}
                  </span>
                </div>

                {/* Timestamp */}
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: `${space.xs}px` }}>
                  {item.timestamp ? item.timestamp.toLocaleString() : 'Unknown time'}
                </div>

                {/* Signature */}
                {item.signature && (
                  <a
                    href={`https://explorer.solana.com/tx/${item.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '10px',
                      fontFamily: typography.fontMono,
                      color: colors.accent + '80',
                      textDecoration: 'none',
                    }}
                  >
                    {item.signature.slice(0, 20)}...
                  </a>
                )}
              </div>

              {/* Status Badge */}
              <StatusBadge status={item.status} type={item.type} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─────────────────── Sub-Components ───────────────────

const StatusBadge = ({ status, type }: { status: string; type: string }) => {
  const config = (() => {
    if (type === 'stealth') {
      return status === 'claimable' 
        ? { bg: colors.successLight, color: colors.success, label: 'Claimable' }
        : { bg: colors.surface2, color: colors.textMuted, label: 'Claimed' };
    }
    switch (status) {
      case 'finalized': return { bg: colors.successLight, color: colors.success, label: 'Finalized' };
      case 'confirmed': return { bg: colors.infoLight, color: colors.info, label: 'Confirmed' };
      case 'failed': return { bg: colors.dangerLight, color: colors.danger, label: 'Failed' };
      default: return { bg: colors.surface2, color: colors.textMuted, label: status };
    }
  })();

  return (
    <div style={{
      padding: `2px ${space.sm}px`,
      borderRadius: radii.full,
      background: config.bg,
      fontSize: '11px',
      fontWeight: '600',
      color: config.color,
      whiteSpace: 'nowrap',
    }}>
      {config.label}
    </div>
  );
};
