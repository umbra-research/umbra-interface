'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { colors, space, radii, typography, motion } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAppContext } from '../../components/Providers';
import { UmbraService } from '../../services/umbra';
import { Cluster } from '../../mockData';

interface UmbraKeys {
  viewPub: string;
  spendPub: string;
  viewSecret: string;
  spendSecret: string;
}

export default function SettingsPage() {
  const { selectedCluster, setSelectedCluster } = useAppContext();
  const { publicKey, connected, disconnect } = useWallet();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [identity, setIdentity] = useState<UmbraKeys | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Load identity
  useEffect(() => {
    if (!connected || !publicKey) { setIdentity(null); return; }
    const stored = localStorage.getItem(`umbra_identity_${publicKey.toBase58()}`);
    if (stored) {
      try { setIdentity(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, [connected, publicKey]);

  const stealthAddress = identity ? `${identity.viewPub}:${identity.spendPub}` : '';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // Export identity
  const handleExport = () => {
    if (!identity || !publicKey) return;
    const blob = new Blob([JSON.stringify(identity, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `umbra-identity-${publicKey.toBase58().slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import identity
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !publicKey) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.viewPub || !data.spendPub || !data.viewSecret || !data.spendSecret) {
          throw new Error('Invalid identity file format');
        }
        setIdentity(data);
        localStorage.setItem(`umbra_identity_${publicKey.toBase58()}`, JSON.stringify(data));
        setImportStatus('✅ Identity imported successfully');
        setTimeout(() => setImportStatus(null), 3000);
      } catch (err: any) {
        setImportStatus(`❌ ${err.message}`);
        setTimeout(() => setImportStatus(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  // Clear all data
  const handleClearData = () => {
    if (!confirm('Clear all local Umbra data? This will remove your saved identity and scan history.')) return;
    if (publicKey) {
      localStorage.removeItem(`umbra_identity_${publicKey.toBase58()}`);
      localStorage.removeItem(`umbra_owned_${publicKey.toBase58()}`);
    }
    localStorage.removeItem('umbra_last_sync_timestamp');
    setIdentity(null);
  };

  const clusters: { name: Cluster; label: string }[] = [
    { name: 'devnet', label: 'Devnet' },
    { name: 'localnet', label: 'Localnet' },
    { name: 'mainnet-beta', label: 'Mainnet' },
  ];

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto', padding: `${space.md}px ${space.md}px ${space.huge}px` }}>
      <div style={{ marginBottom: `${space.lg}px` }}>
        <h1 style={{ ...typography.h2, color: colors.text }}>Settings</h1>
        <p style={{ ...typography.bodySm, color: colors.textMuted }}>
          Manage your identity, network, and preferences
        </p>
      </div>

      {/* ── Identity Management ── */}
      <Card style={{ marginBottom: `${space.md}px` }}>
        <SectionHeader icon="🔐" title="Stealth Identity" />

        {identity ? (
          <>
            {/* Stealth Address */}
            <div style={{ marginBottom: `${space.md}px` }}>
              <div style={{ fontSize: '11px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                Your Stealth Address
              </div>
              <div 
                onClick={() => copyToClipboard(stealthAddress, 'stealth')}
                style={{
                  padding: `${space.sm}px ${space.md}px`,
                  background: colors.surface,
                  borderRadius: radii.sm,
                  border: `1px solid ${colors.border}`,
                  fontFamily: typography.fontMono,
                  fontSize: '11px',
                  color: colors.accent,
                  wordBreak: 'break-all',
                  cursor: 'pointer',
                }}
              >
                {stealthAddress}
              </div>
              <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
                {copied === 'stealth' ? '✓ Copied!' : 'Click to copy · Share this to receive payments'}
              </div>
            </div>

            {/* Public Keys */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${space.sm}px`, marginBottom: `${space.md}px` }}>
              <KeyBox label="View Public Key" value={identity.viewPub} onCopy={copyToClipboard} copied={copied} />
              <KeyBox label="Spend Public Key" value={identity.spendPub} onCopy={copyToClipboard} copied={copied} />
            </div>

            {/* Secret Keys */}
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
                marginBottom: `${space.md}px`,
              }}
            >
              {showSecrets ? '▼ Hide Secret Keys' : '► Reveal Secret Keys'}
            </button>

            {showSecrets && (
              <div style={{
                padding: `${space.md}px`,
                background: colors.dangerLight,
                borderRadius: radii.sm,
                border: `1px solid ${colors.danger}20`,
                marginBottom: `${space.md}px`,
              }}>
                <BlurField label="View Secret" value={identity.viewSecret} onCopy={copyToClipboard} copied={copied} />
                <BlurField label="Spend Secret" value={identity.spendSecret} onCopy={copyToClipboard} copied={copied} />
                <div style={{ fontSize: '10px', color: colors.danger, textAlign: 'center' }}>
                  ⚠ Never share these. Anyone with them can steal your funds.
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: `${space.sm}px` }}>
              <Button variant="secondary" size="sm" onClick={handleExport} fullWidth>
                ⬇ Export Identity
              </Button>
              <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} fullWidth>
                ⬆ Import Identity
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />

            {importStatus && (
              <div style={{
                marginTop: `${space.sm}px`,
                padding: `${space.xs}px ${space.md}px`,
                borderRadius: radii.sm,
                fontSize: '12px',
                color: importStatus.startsWith('✅') ? colors.success : colors.danger,
                background: importStatus.startsWith('✅') ? colors.successLight : colors.dangerLight,
                textAlign: 'center',
              }}>
                {importStatus}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: `${space.lg}px 0` }}>
            <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: `${space.md}px` }}>
              {connected ? 'No identity found. Generate one from the Dashboard.' : 'Connect your wallet first.'}
            </div>
            {connected && (
              <Button variant="primary" size="sm" onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* ── Network Settings ── */}
      <Card style={{ marginBottom: `${space.md}px` }}>
        <SectionHeader icon="🌐" title="Network" />
        <div style={{ display: 'flex', gap: `${space.sm}px`, flexWrap: 'wrap' }}>
          {clusters.map(cluster => (
            <Button
              key={cluster.name}
              variant={selectedCluster === cluster.name ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedCluster(cluster.name)}
            >
              {selectedCluster === cluster.name ? '● ' : ''}{cluster.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* ── Security ── */}
      <Card style={{ marginBottom: `${space.md}px` }}>
        <SectionHeader icon="🛡️" title="Security & Privacy" />

        <Button variant="ghost" fullWidth onClick={handleClearData} style={{ marginBottom: `${space.sm}px` }}>
          🗑 Clear Local Data
        </Button>

        {connected && (
          <Button variant="destructive" fullWidth onClick={() => disconnect()}>
            Disconnect Wallet
          </Button>
        )}

        <div style={{
          marginTop: `${space.md}px`,
          padding: `${space.sm}px ${space.md}px`,
          background: colors.warningLight,
          borderRadius: radii.sm,
          border: `1px solid ${colors.warning}20`,
          fontSize: '11px',
          color: colors.warning,
        }}>
          ⚠ Clearing local data removes your saved identity and scan history. 
          Make sure to export your identity first!
        </div>
      </Card>

      {/* ── About ── */}
      <Card style={{ background: colors.surface2 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: `${space.sm}px`, fontFamily: typography.fontDisplay }}>⦲ Umbra</div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: `${space.xs}px` }}>v0.1.0-beta</div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Private payments on Solana via stealth addresses
          </div>
          <div style={{ marginTop: `${space.md}px`, fontSize: '10px', color: colors.textMuted }}>
            ECDH · Curve25519 · No Trusted Setup
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─────────────────── Sub-Components ───────────────────

const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
  <div style={{ 
    display: 'flex', alignItems: 'center', gap: `${space.sm}px`,
    marginBottom: `${space.md}px`,
    paddingBottom: `${space.sm}px`,
    borderBottom: `1px solid ${colors.border}`,
  }}>
    <span style={{ fontSize: '16px' }}>{icon}</span>
    <span style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>{title}</span>
  </div>
);

const KeyBox = ({ label, value, onCopy, copied }: { 
  label: string; value: string; onCopy: (v: string, l: string) => void; copied: string | null;
}) => (
  <div 
    onClick={() => onCopy(value, label)}
    style={{
      padding: `${space.sm}px`,
      background: colors.surface,
      borderRadius: radii.sm,
      border: `1px solid ${colors.border}`,
      cursor: 'pointer',
    }}
  >
    <div style={{ fontSize: '9px', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
      {label}
    </div>
    <div style={{
      fontFamily: typography.fontMono,
      fontSize: '10px',
      color: colors.text,
      wordBreak: 'break-all',
      lineHeight: '1.4',
    }}>
      {value.slice(0, 24)}...
    </div>
    <div style={{ fontSize: '9px', color: colors.accent, marginTop: '4px' }}>
      {copied === label ? '✓ Copied' : 'Click to copy'}
    </div>
  </div>
);

const BlurField = ({ label, value, onCopy, copied }: { 
  label: string; value: string; onCopy: (v: string, l: string) => void; copied: string | null;
}) => (
  <div style={{ marginBottom: `${space.sm}px` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
      <span style={{ fontSize: '10px', color: colors.danger, textTransform: 'uppercase' }}>{label}</span>
      <button
        onClick={() => onCopy(value, label)}
        style={{ background: 'none', border: 'none', color: colors.danger, fontSize: '10px', cursor: 'pointer' }}
      >
        {copied === label ? '✓ Copied' : 'Copy'}
      </button>
    </div>
    <div
      style={{
        fontFamily: typography.fontMono, fontSize: '11px', color: colors.danger,
        wordBreak: 'break-all', padding: '6px', background: 'rgba(0,0,0,0.2)',
        borderRadius: '4px', filter: 'blur(3px)', cursor: 'pointer',
        transition: 'filter 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = 'none')}
      onMouseLeave={(e) => (e.currentTarget.style.filter = 'blur(3px)')}
    >
      {value}
    </div>
  </div>
);
