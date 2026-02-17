'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { colors, space, radii, typography, shadows, motion } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { UmbraService } from '../../services/umbra';
import { useSyncEngine } from '../../hooks/useSyncEngine';
import { SendForm } from '../../components/SendForm';
import { WithdrawForm } from '../../components/WithdrawForm';

// ───────────────────────────── Types ─────────────────────────────
interface UmbraKeys {
  viewPub: string;
  spendPub: string;
  viewSecret: string;
  spendSecret: string;
}

// ───────────────────────────── Dashboard ─────────────────────────────
export default function Dashboard() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();

  // Identity state
  const [identity, setIdentity] = useState<UmbraKeys | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wasmReady, setWasmReady] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showBackupPrompt, setShowBackupPrompt] = useState(false);

  // Active view
  const [activeTab, setActiveTab] = useState<'send' | 'withdraw'>('send');

  // Sync engine
  const userId = publicKey?.toBase58() || null;
  const viewSecret = identity?.viewSecret || null;
  const { isScanning, ownedItems, scan } = useSyncEngine(viewSecret, userId);

  const claimableCount = ownedItems.filter(i => i.status === 'Pending').length;
  const claimableAmount = ownedItems
    .filter(i => i.status === 'Pending')
    .reduce((acc, i) => acc + (i.amount || 0), 0);

  // ── Init WASM ──
  useEffect(() => {
    UmbraService.init()
      .then(() => setWasmReady(true))
      .catch((e) => console.error('WASM init failed:', e));
  }, []);

  // ── Load or generate identity per wallet ──
  useEffect(() => {
    if (!connected || !publicKey || !wasmReady) {
      setIdentity(null);
      return;
    }

    const storageKey = `umbra_identity_${publicKey.toBase58()}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try { setIdentity(JSON.parse(stored)); } 
      catch { setIdentity(null); }
    }
  }, [connected, publicKey, wasmReady]);

  // ── Generate identity ──
  const handleGenerateIdentity = useCallback(async () => {
    if (!wasmReady || !publicKey) return;
    setIsGenerating(true);
    try {
      const id = await UmbraService.generateIdentity();
      const json = id.to_json();
      const data = JSON.parse(json);
      
      const keys: UmbraKeys = {
        viewPub: data.viewPub,
        spendPub: data.spendPub,
        viewSecret: data.viewSecret,
        spendSecret: data.spendSecret,
      };
      
      // Free the WASM memory
      id.free();
      
      setIdentity(keys);
      localStorage.setItem(`umbra_identity_${publicKey.toBase58()}`, JSON.stringify(keys));
      setShowBackupPrompt(true);
    } catch (e) {
      console.error('Identity generation failed:', e);
    } finally {
      setIsGenerating(false);
    }
  }, [wasmReady, publicKey]);

  // ── Export identity as encrypted JSON ──
  const handleExportIdentity = useCallback(() => {
    if (!identity) return;
    const blob = new Blob([JSON.stringify(identity, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `umbra-identity-${publicKey?.toBase58().slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowBackupPrompt(false);
  }, [identity, publicKey]);

  // ── Copy to clipboard ──
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Stealth address for sharing ──
  const stealthAddress = identity ? `${identity.viewPub}:${identity.spendPub}` : '';

  // ─────────────────── RENDER ───────────────────

  // Not connected
  if (!connected) {
    return (
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: `${space.xxl}px ${space.lg}px` }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '64px', 
            marginBottom: `${space.xl}px`,
            filter: 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.3))'
          }}>
            🛡️
          </div>
          <h1 style={{ ...typography.h1, color: colors.accent, marginBottom: `${space.md}px` }}>
            Umbra Protocol
          </h1>
          <p style={{ 
            ...typography.body, 
            color: colors.textSecondary, 
            marginBottom: `${space.xxl}px`,
            maxWidth: '400px',
            margin: `0 auto ${space.xxl}px`
          }}>
            Private payments on Solana. No mixing pools. No trusted setup. Just math.
          </p>
          <Button variant="primary" size="lg" onClick={() => setVisible(true)}>
            Connect Wallet
          </Button>
          <div style={{ 
            marginTop: `${space.xxl}px`,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: `${space.md}px`
          }}>
            {[
              { icon: '🔐', label: 'Stealth Addresses' },
              { icon: '⚡', label: 'Gasless Claims' },
              { icon: '💬', label: 'Encrypted Memos' },
            ].map(f => (
              <div key={f.label} style={{ 
                padding: `${space.md}px`,
                background: colors.surface,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px', marginBottom: `${space.xs}px` }}>{f.icon}</div>
                <div style={{ fontSize: '11px', color: colors.textMuted }}>{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Connected but no identity — Onboarding
  if (!identity) {
    return (
      <div style={{ maxWidth: '520px', margin: '0 auto', padding: `${space.xxl}px ${space.lg}px` }}>
        <div style={{ textAlign: 'center', marginBottom: `${space.xxl}px` }}>
          <div style={{ 
            width: '80px', height: '80px', 
            borderRadius: '50%', 
            background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}05)`,
            border: `2px solid ${colors.accent}40`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', marginBottom: `${space.lg}px`
          }}>
            🔑
          </div>
          <h2 style={{ ...typography.h2, color: colors.text, marginBottom: `${space.md}px` }}>
            Generate Your Stealth Identity
          </h2>
          <p style={{ ...typography.bodySm, color: colors.textSecondary, maxWidth: '380px', margin: '0 auto' }}>
            Create a cryptographic keypair that lets others send you private payments. 
            Only you can scan and claim them.
          </p>
        </div>

        <Card style={{ marginBottom: `${space.lg}px` }}>
          <div style={{ padding: `${space.md}px` }}>
            {/* Step indicators */}
            <div style={{ display: 'flex', gap: `${space.md}px`, marginBottom: `${space.xl}px` }}>
              {['Connect Wallet', 'Generate Identity', 'Backup Keys'].map((step, i) => (
                <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    background: i === 0 ? colors.accent : i === 1 ? colors.surface2 : colors.surface,
                    border: `2px solid ${i === 0 ? colors.accent : i === 1 ? colors.accent + '60' : colors.border}`,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: '700',
                    color: i === 0 ? colors.accentContrast : i === 1 ? colors.accent : colors.textMuted,
                    marginBottom: `${space.xs}px`
                  }}>
                    {i === 0 ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: '11px', color: i <= 1 ? colors.text : colors.textMuted }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>

            <Button 
              variant="primary" 
              fullWidth
              size="lg"
              onClick={handleGenerateIdentity}
              disabled={isGenerating || !wasmReady}
            >
              {!wasmReady ? '○ Initializing Crypto Engine...' : isGenerating ? '⟳ Computing Keys...' : '🔑 Generate Stealth Identity'}
            </Button>

            <div style={{ 
              marginTop: `${space.md}px`, 
              fontSize: '12px', 
              color: colors.textMuted,
              textAlign: 'center'
            }}>
              Uses ECDH on Curve25519 — no trusted setup required
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ─── Main Dashboard (Connected + Identity) ───
  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: `${space.md}px ${space.md}px ${space.huge}px` }}>
      
      {/* ── Backup Prompt ── */}
      {showBackupPrompt && (
        <Card style={{ 
          marginBottom: `${space.lg}px`,
          borderColor: colors.warning + '60',
          background: colors.warningLight,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
            <div style={{ fontSize: '24px' }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.warning, marginBottom: '4px' }}>
                Backup Your Identity
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                Without a backup, you lose access to all stealth payments forever.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: `${space.sm}px`, marginTop: `${space.md}px` }}>
            <Button variant="primary" size="sm" onClick={handleExportIdentity} style={{ flex: 1 }}>
              ⬇ Download Backup
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowBackupPrompt(false)} style={{ flex: 0 }}>
              Later
            </Button>
          </div>
        </Card>
      )}

      {/* ── Identity Card ── */}
      <Card style={{ marginBottom: `${space.md}px` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: `${space.md}px` }}>
          <div>
            <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Stealth Identity
            </div>
            <div style={{ 
              fontSize: '13px', color: colors.accent, fontFamily: typography.fontMono, 
              marginTop: '4px', cursor: 'pointer',
              wordBreak: 'break-all',
              maxWidth: '280px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={stealthAddress}
            onClick={() => copyToClipboard(stealthAddress, 'address')}
            >
              {stealthAddress.slice(0, 20)}...{stealthAddress.slice(-12)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: `${space.xs}px` }}>
            <ActionButton 
              icon={copied === 'address' ? '✓' : '📋'} 
              label="Copy" 
              onClick={() => copyToClipboard(stealthAddress, 'address')} 
            />
            <ActionButton icon="⬇️" label="Export" onClick={handleExportIdentity} />
          </div>
        </div>

        {/* Expandable secrets */}
        <button
          onClick={() => setShowSecrets(!showSecrets)}
          style={{
            width: '100%',
            padding: `${space.sm}px`,
            background: showSecrets ? colors.dangerLight : colors.surface2,
            border: `1px solid ${showSecrets ? colors.danger + '30' : colors.border}`,
            borderRadius: radii.sm,
            color: showSecrets ? colors.danger : colors.textMuted,
            fontSize: '11px',
            cursor: 'pointer',
            transition: motion.fast,
            textAlign: 'center',
          }}
        >
          {showSecrets ? '▼ Hide Secret Keys' : '► View Secret Keys (sensitive)'}
        </button>

        {showSecrets && (
          <div style={{ 
            marginTop: `${space.sm}px`, 
            padding: `${space.md}px`,
            background: colors.dangerLight,
            borderRadius: radii.sm,
            border: `1px solid ${colors.danger}20`,
          }}>
            <SecretRow label="View Secret" value={identity.viewSecret} onCopy={copyToClipboard} copied={copied} />
            <SecretRow label="Spend Secret" value={identity.spendSecret} onCopy={copyToClipboard} copied={copied} />
            <div style={{ fontSize: '10px', color: colors.danger, marginTop: `${space.sm}px`, textAlign: 'center' }}>
              ⚠ Never share your secret keys. Anyone with these can steal your funds.
            </div>
          </div>
        )}
      </Card>

      {/* ── Claimable Alert ── */}
      {claimableCount > 0 && (
        <Card 
          hoverable
          onClick={() => setActiveTab('withdraw')}
          style={{ 
            marginBottom: `${space.md}px`,
            cursor: 'pointer',
            borderColor: colors.success + '40',
            background: colors.successLight,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${space.md}px` }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '50%',
                background: colors.success + '20', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px'
              }}>💰</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: colors.success }}>
                  {claimableCount} payment{claimableCount > 1 ? 's' : ''} claimable
                </div>
                <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                  Tap to withdraw funds
                </div>
              </div>
            </div>
            <div style={{ fontSize: '14px', color: colors.success }}>→</div>
          </div>
        </Card>
      )}

      {/* ── Tab Switcher ── */}
      <div style={{ 
        display: 'flex', 
        gap: '2px',
        marginBottom: `${space.md}px`,
        background: colors.surface,
        borderRadius: radii.md,
        padding: '3px',
        border: `1px solid ${colors.border}`,
      }}>
        {(['send', 'withdraw'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: `${space.sm}px`,
              borderRadius: `calc(${radii.md} - 3px)`,
              background: activeTab === tab ? colors.surface3 : 'transparent',
              border: 'none',
              color: activeTab === tab ? colors.text : colors.textMuted,
              fontSize: '13px',
              fontWeight: activeTab === tab ? '600' : '400',
              cursor: 'pointer',
              transition: motion.fast,
            }}
          >
            {tab === 'send' ? '📤 Send' : `📥 Withdraw${claimableCount > 0 ? ` (${claimableCount})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── Active Form ── */}
      <Card style={{ marginBottom: `${space.md}px` }}>
        {activeTab === 'send' ? (
          <SendForm />
        ) : (
          <WithdrawForm
            items={ownedItems}
            identity={identity}
            onClaimSuccess={() => scan()}
          />
        )}
      </Card>

      {/* ── Recent Activity ── */}
      {ownedItems.length > 0 && (
        <Card>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: `${space.md}px`
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: colors.text }}>
              ⚡ Recent Stealth Signals
            </div>
            <button 
              onClick={() => scan()}
              disabled={isScanning}
              style={{
                background: 'none', border: 'none', 
                color: colors.accent, fontSize: '12px', cursor: 'pointer',
                opacity: isScanning ? 0.5 : 1,
              }}
            >
              {isScanning ? '⟳ Scanning...' : '↻ Refresh'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.sm}px` }}>
            {ownedItems.slice(0, 5).map((item, i) => (
              <div key={item.id || i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: `${space.sm}px ${space.md}px`,
                background: colors.surface,
                borderRadius: radii.sm,
                border: `1px solid ${colors.border}`,
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: colors.text }}>
                    {item.plaintext || 'Stealth Payment'}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.textMuted }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  padding: '2px 8px',
                  borderRadius: radii.full,
                  background: item.status === 'Pending' ? colors.successLight : colors.surface2,
                  color: item.status === 'Pending' ? colors.success : colors.textMuted,
                  fontWeight: '600'
                }}>
                  {item.status === 'Pending' ? 'Claimable' : 'Claimed'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─────────────────── Sub-Components ───────────────────

const ActionButton = ({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    title={label}
    style={{
      width: '36px', height: '36px',
      borderRadius: radii.sm,
      background: colors.surface2,
      border: `1px solid ${colors.border}`,
      color: colors.text,
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: motion.fast,
    }}
  >
    {icon}
  </button>
);

const SecretRow = ({ label, value, onCopy, copied }: { 
  label: string; value: string; onCopy: (text: string, label: string) => void; copied: string | null;
}) => (
  <div style={{ marginBottom: `${space.sm}px` }}>
    <div style={{ 
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: '2px'
    }}>
      <span style={{ fontSize: '10px', color: colors.danger, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
      <button
        onClick={() => onCopy(value, label)}
        style={{
          background: 'none', border: 'none', color: colors.danger,
          fontSize: '10px', cursor: 'pointer', opacity: 0.7,
        }}
      >
        {copied === label ? '✓ Copied' : 'Copy'}
      </button>
    </div>
    <div style={{
      fontFamily: typography.fontMono,
      fontSize: '11px',
      color: colors.danger,
      wordBreak: 'break-all',
      padding: '6px',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '4px',
      filter: 'blur(3px)',
      cursor: 'pointer',
      transition: 'filter 0.2s',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.filter = 'none')}
    onMouseLeave={(e) => (e.currentTarget.style.filter = 'blur(3px)')}
    >
      {value}
    </div>
  </div>
);
