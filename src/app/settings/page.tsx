'use client';

import React, { useState } from 'react';
import { colors, space, radii, typography } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAppContext } from '../../components/Providers';
import { mockClusters } from '../../mockData';

export default function SettingsPage() {
  const { selectedCluster, setSelectedCluster } = useAppContext();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);
  const [customRpc, setCustomRpc] = useState('');

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: `${space.lg}px` }}>
        <h1 style={typography.h1}>Settings</h1>
        <p style={{ ...typography.bodySm, color: colors.textMuted }}>
          Manage your preferences and Solana cluster configuration.
        </p>
      </div>

      {/* Cluster Settings */}
      <Card style={{ marginBottom: `${space.lg}px` }}>
        <div style={{ marginBottom: `${space.lg}px` }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: `${space.md}px` }}>
            Solana Cluster
          </div>
          <div style={{
            display: 'flex',
            gap: `${space.md}px`,
            marginBottom: `${space.lg}px`,
            flexWrap: 'wrap',
          }}>
            {mockClusters.map(cluster => (
              <Button
                key={cluster.name}
                variant={selectedCluster === cluster.name ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCluster(cluster.name)}
              >
                {cluster.label}
              </Button>
            ))}
          </div>

          <div style={{ marginBottom: `${space.lg}px` }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: colors.textMuted,
              marginBottom: `${space.sm}px`,
            }}>
              Custom RPC URL (Optional)
            </label>
            <Input
              placeholder="https://api.custom.com"
              value={customRpc}
              onChange={(e) => setCustomRpc(e.target.value)}
            />
          </div>

          <Button variant="secondary" fullWidth>
            Save Cluster Settings
          </Button>
        </div>
      </Card>

      {/* Display Settings */}
      <Card style={{ marginBottom: `${space.lg}px` }}>
        <div style={{ marginBottom: `${space.lg}px` }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: `${space.md}px` }}>
            Display
          </div>

          <div style={{ marginBottom: `${space.lg}px` }}>
            <label style={{
              display: 'flex',
              gap: `${space.md}px`,
              alignItems: 'center',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={hideBalances}
                onChange={(e) => setHideBalances(e.target.checked)}
              />
              <span style={{ fontSize: '14px' }}>Hide balances</span>
            </label>
          </div>

          <div>
            <label style={{
              display: 'flex',
              gap: `${space.md}px`,
              alignItems: 'center',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => setReducedMotion(e.target.checked)}
              />
              <span style={{ fontSize: '14px' }}>Reduce motion</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card style={{ marginBottom: `${space.lg}px` }}>
        <div style={{ marginBottom: `${space.lg}px` }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: colors.danger, marginBottom: `${space.md}px` }}>
            Security & Privacy
          </div>

          <Button variant="destructive" fullWidth style={{ marginBottom: `${space.md}px` }}>
            Lock Session
          </Button>

          <Button variant="ghost" fullWidth style={{ marginBottom: `${space.md}px` }}>
            Clear Local Data
          </Button>

          <Card variant="outlined" style={{ marginBottom: `${space.md}px`, borderColor: colors.danger }}>
            <div style={{ fontSize: '12px', color: colors.danger }}>
              ⚠ Clearing local data will remove all cached information but won't affect your addresses.
            </div>
          </Card>
        </div>
      </Card>

      {/* About */}
      <Card style={{ background: colors.surface2 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: `${space.md}px` }}>⦲ Umbra</div>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: `${space.sm}px` }}>
            Version 1.0.0-beta
          </div>
          <div style={{ fontSize: '11px', color: colors.textMuted }}>
            Anonymous transfer protocol for Solana
          </div>
          <div style={{ marginTop: `${space.lg}px`, display: 'flex', gap: `${space.md}px`, justifyContent: 'center' }}>
            <Button variant="ghost" size="sm">
              Docs
            </Button>
            <Button variant="ghost" size="sm">
              GitHub
            </Button>
            <Button variant="ghost" size="sm">
              Support
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
