'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { colors, space, radii, typography } from '../../theme';
import { useAppContext } from '../../components/Providers';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { mockActivity } from '../../mockData';
import { formatAddress, getWalletTransactions, Cluster } from '../../services/solana';

interface Transaction {
  signature: string;
  status: 'submitted' | 'confirmed' | 'finalized' | 'failed';
  timestamp: Date | null;
  fee: number;
}

export default function ActivityPage() {
  const { selectedCluster } = useAppContext();
  const { publicKey, connected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'sent' | 'received'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'confirmed' | 'submitted' | 'failed'>('all');
  const [search, setSearch] = useState('');

  // Fetch real transactions from wallet
  useEffect(() => {
    if (connected && publicKey) {
      fetchTransactions();
      const interval = setInterval(fetchTransactions, 15000);
      return () => clearInterval(interval);
    } else {
      setTransactions([]);
    }
  }, [connected, publicKey, selectedCluster]);

  const fetchTransactions = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const txs = await getWalletTransactions(selectedCluster as Cluster, publicKey, 20);
      setTransactions(txs);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback to mock data
  const items = connected && publicKey && transactions.length > 0 
    ? transactions 
    : mockActivity.filter(item => {
        const matchCluster = item.cluster === selectedCluster;
        const matchType = selectedType === 'all' || 
          (selectedType === 'sent' && item.type === 'Sent') ||
          (selectedType === 'received' && item.type === 'Received');
        const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;
        const matchSearch = !search || 
          item.token.includes(search.toUpperCase()) ||
          item.counterpartyMasked.includes(search);
        
        return matchCluster && matchType && matchStatus && matchSearch;
      });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'finalized': return 'success';
      case 'submitted': return 'info';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: `${space.lg}px` }}>
        <h1 style={typography.h1}>Activity</h1>
        <p style={{ ...typography.bodySm, color: colors.textMuted }}>
          {connected ? 'Your transaction history' : 'View transfer activity'}
        </p>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: `${space.lg}px`, display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
        <Input
          placeholder="Search signature or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          clearable
          onClear={() => setSearch('')}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: `${space.md}px` }}>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            style={{
              width: '100%',
              padding: `${space.sm}px ${space.md}px`,
              background: colors.surface2,
              border: `1px solid ${colors.border}`,
              borderRadius: `${radii.md}px`,
              color: colors.text,
              fontSize: '13px',
              height: '44px',
            }}
          >
            <option value="all">All Types</option>
            <option value="sent">Sent</option>
            <option value="received">Received</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            style={{
              width: '100%',
              padding: `${space.sm}px ${space.md}px`,
              background: colors.surface2,
              border: `1px solid ${colors.border}`,
              borderRadius: `${radii.md}px`,
              color: colors.text,
              fontSize: '13px',
              height: '44px',
            }}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="submitted">Submitted</option>
            <option value="failed">Failed</option>
          </select>

          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => {
              setSelectedType('all');
              setSelectedStatus('all');
              setSearch('');
              if (connected) fetchTransactions();
            }}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Activity List */}
      {!connected ? (
        <Card variant="outlined" style={{ borderColor: colors.warning }}>
          <div style={{ textAlign: 'center', padding: `${space.lg}px` }}>
            <div style={{ fontSize: '32px', marginBottom: `${space.md}px` }}>🔐</div>
            <div style={{ color: colors.warning }}>
              Connect your wallet to see transaction history
            </div>
          </div>
        </Card>
      ) : items.length === 0 ? (
        <Card variant="glass">
          <div style={{ textAlign: 'center', padding: `${space.lg}px` }}>
            <div style={{ fontSize: '32px', marginBottom: `${space.md}px` }}>📭</div>
            <div style={{ color: colors.textMuted }}>
              No activity found
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
          {items.map((item: any, idx: number) => (
            <Card key={item.signature || item.id || idx} hoverable>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: `${space.md}px` }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>
                    {item.signature ? 'Transaction' : item.type}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: `${space.xs}px` }}>
                    {item.signature ? formatAddress(item.signature) : (item.counterpartyMasked || 'Unknown')}
                  </div>
                </div>
                <Badge variant={item.signature ? getStatusColor(item.status) : 'default'}>
                  {item.signature ? (item.status === 'finalized' ? '✓✓' : item.status === 'confirmed' ? '✓' : item.status === 'submitted' ? '⏳' : '✕') : (item.status || '•')}
                </Badge>
              </div>

              <div style={{ fontSize: '12px', color: colors.textMuted }}>
                {item.timestamp ? (typeof item.timestamp === 'string' ? item.timestamp : new Date(item.timestamp).toLocaleString()) : '—'}
              </div>

              {item.signature && (
                <div style={{
                  fontSize: '11px',
                  color: colors.textMuted,
                  fontFamily: 'monospace',
                  marginTop: `${space.md}px`,
                  wordBreak: 'break-all',
                  padding: `${space.sm}px`,
                  background: colors.surface2,
                  borderRadius: `${radii.sm}px`,
                }}>
                  {item.signature}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
