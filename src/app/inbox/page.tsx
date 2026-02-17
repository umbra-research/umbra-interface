'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { colors, space, radii, typography, motion } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { UmbraService } from '../../services/umbra';
import { useSyncEngine } from '../../hooks/useSyncEngine';
import { claimFunds } from '../../lib/api';
import { StealthSignal } from '../../types/umbra';

export default function InboxPage() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();

  // Identity
  const [identity, setIdentity] = useState<any>(null);
  const [wasmReady, setWasmReady] = useState(false);

  // Filter
  const [filter, setFilter] = useState<'all' | 'claimable' | 'claimed'>('all');

  // Claim state
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  // Sync engine
  const userId = publicKey?.toBase58() || null;
  const viewSecret = identity?.viewSecret || null;
  const { isScanning, ownedItems, scan } = useSyncEngine(viewSecret, userId);

  // Init
  useEffect(() => {
    UmbraService.init().then(() => setWasmReady(true)).catch(console.error);
  }, []);

  // Load identity
  useEffect(() => {
    if (!connected || !publicKey) { setIdentity(null); return; }
    const stored = localStorage.getItem(`umbra_identity_${publicKey.toBase58()}`);
    if (stored) {
      try { setIdentity(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [connected, publicKey]);

  // Filter items
  const filteredItems = ownedItems.filter(item => {
    if (filter === 'claimable') return item.status === 'Pending';
    if (filter === 'claimed') return item.status === 'Claimed';
    return true;
  });

  const claimableCount = ownedItems.filter(i => i.status === 'Pending').length;
  const claimedCount = ownedItems.filter(i => i.status === 'Claimed').length;

  // Claim handler
  const handleClaim = useCallback(async (item: StealthSignal) => {
    if (!publicKey || !identity) return;
    setClaimingId(item.id);
    setClaimStatus('Recovering stealth keys...');

    try {
      // 1. Recover keys
      const { secret: stealthSecret, pubkey: stealthPubkey } = await UmbraService.recoverStealthSecret(
        identity.viewSecret,
        identity.spendSecret,
        item.ephemeral_pubkey
      );

      // 2. Build relay message
      const { PublicKey } = await import('@solana/web3.js');
      const recipientPk = publicKey.toBase58();
      const recipientBytes = new PublicKey(recipientPk).toBytes();
      const recipientHex = Buffer.from(recipientBytes).toString('hex');
      
      const RELAYER_FEE = 1000;
      const toLeHex = (num: number, bytes: number) => {
        const buf = Buffer.alloc(bytes);
        buf.writeBigUInt64LE(BigInt(num), 0);
        return buf.toString('hex');
      };

      const messageHex = stealthPubkey + recipientHex + toLeHex(0, 8) + toLeHex(RELAYER_FEE, 8);

      setClaimStatus('Signing request...');
      const signature = await UmbraService.signRelayerRequest(stealthSecret, messageHex);

      setClaimStatus('Submitting to relayer...');
      const payload = {
        stealth_pubkey: new PublicKey(Buffer.from(stealthPubkey, 'hex')).toBase58(),
        recipient_pubkey: recipientPk,
        amount: 0,
        relayer_fee: RELAYER_FEE,
        signature,
      };

      const res = await fetch('http://localhost:8080/relay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Relay failed: ${err}`);
      }

      const data = await res.json();
      if (data.status === 'failed') throw new Error(data.error || 'Relay returned failure');

      // Mark as claimed
      setClaimStatus('Finalizing...');
      await claimFunds(item.id, recipientPk);

      setClaimStatus('✅ Claimed successfully!');
      setTimeout(() => { setClaimingId(null); setClaimStatus(null); scan(); }, 2000);

    } catch (e: any) {
      console.error('Claim failed:', e);
      setClaimStatus(`❌ ${e.message}`);
      setTimeout(() => { setClaimingId(null); setClaimStatus(null); }, 5000);
    }
  }, [publicKey, identity, scan]);

  // ── Not Connected ──
  if (!connected) {
    return (
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: `${space.xxl}px ${space.lg}px`, textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: `${space.lg}px` }}>📥</div>
        <h1 style={{ ...typography.h2, color: colors.text, marginBottom: `${space.md}px` }}>Inbox</h1>
        <p style={{ ...typography.bodySm, color: colors.textSecondary, marginBottom: `${space.xl}px` }}>
          Connect your wallet to scan for incoming stealth payments
        </p>
        <Button variant="primary" onClick={() => setVisible(true)}>Connect Wallet</Button>
      </div>
    );
  }

  // ── No Identity ──
  if (!identity) {
    return (
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: `${space.xxl}px ${space.lg}px`, textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: `${space.lg}px` }}>🔑</div>
        <h1 style={{ ...typography.h2, color: colors.text, marginBottom: `${space.md}px` }}>Identity Required</h1>
        <p style={{ ...typography.bodySm, color: colors.textSecondary, marginBottom: `${space.xl}px` }}>
          Generate a stealth identity on the Dashboard first to start scanning for payments.
        </p>
        <Button variant="primary" onClick={() => window.location.href = '/dashboard'}>Go to Dashboard</Button>
      </div>
    );
  }

  // ── Main Inbox ──
  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: `${space.md}px ${space.md}px ${space.huge}px` }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: `${space.lg}px` }}>
        <div>
          <h1 style={{ ...typography.h2, color: colors.text, marginBottom: '2px' }}>Inbox</h1>
          <p style={{ fontSize: '13px', color: colors.textSecondary }}>
            {claimableCount > 0 ? `${claimableCount} claimable` : 'No pending payments'}
            {claimedCount > 0 ? ` · ${claimedCount} claimed` : ''}
          </p>
        </div>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => scan()}
          disabled={isScanning}
        >
          {isScanning ? '⟳ Scanning...' : '↻ Rescan'}
        </Button>
      </div>

      {/* Filter Tabs */}
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
          { key: 'all' as const, label: `All (${ownedItems.length})` },
          { key: 'claimable' as const, label: `Claimable (${claimableCount})` },
          { key: 'claimed' as const, label: `Claimed (${claimedCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              flex: 1,
              padding: `${space.sm}px`,
              borderRadius: `calc(${radii.md} - 3px)`,
              background: filter === tab.key ? colors.surface3 : 'transparent',
              border: 'none',
              color: filter === tab.key ? colors.text : colors.textMuted,
              fontSize: '12px',
              fontWeight: filter === tab.key ? '600' : '400',
              cursor: 'pointer',
              transition: motion.fast,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scanning Indicator */}
      {isScanning && (
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
          ⟳ Scanning for stealth payments...
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && !isScanning && (
        <Card style={{ textAlign: 'center', padding: `${space.xxl}px ${space.lg}px` }}>
          <div style={{ fontSize: '40px', marginBottom: `${space.md}px` }}>
            {filter === 'claimable' ? '💰' : filter === 'claimed' ? '✅' : '📭'}
          </div>
          <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: `${space.sm}px` }}>
            {filter === 'claimable' ? 'No claimable payments' 
             : filter === 'claimed' ? 'No claimed payments yet'
             : 'No payments found'}
          </div>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            Share your stealth address to receive private payments
          </div>
        </Card>
      )}

      {/* Payment Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.sm}px` }}>
        {filteredItems.map((item) => {
          const isClaiming = claimingId === item.id;
          const isPending = item.status === 'Pending';

          return (
            <Card key={item.id} hoverable style={{ opacity: isClaiming ? 0.8 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {/* Memo / Payment Info */}
                  <div style={{ fontSize: '14px', fontWeight: '500', color: colors.text, marginBottom: '4px' }}>
                    {item.plaintext || 'Stealth Payment'}
                  </div>
                  
                  {/* Timestamp */}
                  <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: `${space.sm}px` }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>

                  {/* Payer */}
                  {item.payer && item.payer !== 'unknown' && (
                    <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: typography.fontMono }}>
                      From: {item.payer.slice(0, 8)}...{item.payer.slice(-4)}
                    </div>
                  )}
                </div>

                {/* Status / Action */}
                <div style={{ textAlign: 'right', marginLeft: `${space.md}px` }}>
                  {isPending ? (
                    <button
                      onClick={() => handleClaim(item)}
                      disabled={isClaiming}
                      style={{
                        padding: `${space.xs}px ${space.md}px`,
                        background: isClaiming ? colors.surface2 : colors.successLight,
                        border: `1px solid ${isClaiming ? colors.border : colors.success}40`,
                        borderRadius: radii.full,
                        color: isClaiming ? colors.textMuted : colors.success,
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: isClaiming ? 'default' : 'pointer',
                        transition: motion.fast,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isClaiming ? '⟳ Processing...' : 'Claim →'}
                    </button>
                  ) : (
                    <div style={{
                      padding: `${space.xs}px ${space.md}px`,
                      background: colors.surface2,
                      borderRadius: radii.full,
                      fontSize: '12px',
                      color: colors.textMuted,
                    }}>
                      ✓ Claimed
                    </div>
                  )}
                </div>
              </div>

              {/* Claim Progress */}
              {isClaiming && claimStatus && (
                <div style={{
                  marginTop: `${space.sm}px`,
                  padding: `${space.xs}px ${space.md}px`,
                  background: claimStatus.startsWith('❌') ? colors.dangerLight : colors.infoLight,
                  borderRadius: radii.sm,
                  fontSize: '11px',
                  color: claimStatus.startsWith('❌') ? colors.danger : claimStatus.startsWith('✅') ? colors.success : colors.info,
                }}>
                  {claimStatus}
                </div>
              )}

              {/* Tx Signature */}
              {item.signature && (
                <div style={{
                  marginTop: `${space.sm}px`,
                  fontSize: '10px',
                  color: colors.textMuted,
                  fontFamily: typography.fontMono,
                  wordBreak: 'break-all',
                }}>
                  <a
                    href={`https://explorer.solana.com/tx/${item.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: colors.accent + '80', textDecoration: 'none' }}
                  >
                    {item.signature.slice(0, 24)}...
                  </a>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
