'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { colors, space, radii, typography } from '../../theme';
import { useAppContext } from '../../components/Providers';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { mockAddresses } from '../../mockData';
import { formatAddress } from '../../services/solana';
import { fetchInbox, claimFunds, InboxItem } from '../../lib/api';

// UI Model (extends/wraps API model)
interface InboxUIItem extends InboxItem {
    senderMasked: string;
    cluster: string;
}

export default function InboxPage() {
  const { selectedCluster } = useAppContext();
  const { publicKey, connected } = useWallet();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'claimable' | 'claimed'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [inboxItems, setInboxItems] = useState<InboxUIItem[]>([]);

  const handleClaim = async () => {
      if (!publicKey) return;
      setClaiming(true);
      try {
          const res = await claimFunds(publicKey.toBase58());
          if (res.status === 'success') {
              alert(`Claimed! Signatures: ${res.signatures?.join(', ')}`);
              handleRefresh(); 
          } else {
              alert(`Claim Failed: ${res.error}`);
          }
      } catch (e) {
          alert('Claim Error: ' + e);
      } finally {
          setClaiming(false);
      }
  };

  // Initial fetch when connected
  React.useEffect(() => {
      if (connected && publicKey) {
          handleRefresh();
      }
  }, [connected, publicKey]);

  const handleRefresh = async () => {
    if (!publicKey) return;
    setRefreshing(true);
    try {
        const items = await fetchInbox(publicKey.toBase58());
        const mappedItems: InboxUIItem[] = items.map(i => ({
            ...i,
            cluster: 'localnet', 
            senderMasked: formatAddress(i.payer),
        }));
        setInboxItems(mappedItems);
    } catch (e) {
        console.error(e);
    } finally {
        setRefreshing(false);
    }
  };

  const defaultAddr = mockAddresses.find(a => a.isDefault);
  const displayAddress = connected && publicKey ? formatAddress(publicKey.toString()) : defaultAddr?.publicKeyMasked;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'claimable': return 'success';
      case 'claiming': return 'info';
      case 'claimed': return 'default';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  // Filter items
  const items = inboxItems.filter(item => 
    (selectedFilter === 'all' || 
     (selectedFilter === 'claimable' && item.status === 'claimable') ||
     (selectedFilter === 'claimed' && item.status === 'claimed'))
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: `${space.lg}px` }}>
        <h1 style={typography.h1}>Inbox</h1>
        <p style={{ ...typography.bodySm, color: colors.textMuted }}>
          View and claim anonymous transfers to your Solana wallet.
        </p>
      </div>

      {/* Receiving Address Header */}
      {connected ? (
        <Card style={{ marginBottom: `${space.lg}px`, background: colors.surface2, border: `1px solid ${colors.accent}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: `${space.md}px` }}>
            <div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: `${space.xs}px`, fontWeight: '500', textTransform: 'uppercase' }}>
                Connected Wallet Address
              </div>
              <div style={{
                fontSize: '12px',
                color: colors.text,
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                maxWidth: '100%',
              }}>
                {displayAddress}
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>✓</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: `${space.md}px` }}>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => publicKey && navigator.clipboard.writeText(publicKey.toString())}
            >
              Copy Full
            </Button>
            <Button variant="secondary" size="sm">
              QR Code
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? '…' : 'Rescan'}
            </Button>
          </div>
        </Card>
      ) : (
        <Card variant="outlined" style={{ marginBottom: `${space.lg}px`, borderColor: colors.warning }}>
          <div style={{ fontSize: '13px', color: colors.warning }}>
            ⚠ Connect your wallet to view receiving address
          </div>
        </Card>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: `${space.md}px`, marginBottom: `${space.lg}px` }}>
        {(['all', 'claimable', 'claimed'] as const).map(filter => (
          <Button
            key={filter}
            variant={selectedFilter === filter ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      {/* Inbox List */}
      {items.length === 0 ? (
        <Card variant="glass">
          <div style={{ textAlign: 'center', padding: `${space.lg}px` }}>
            <div style={{ fontSize: '32px', marginBottom: `${space.md}px` }}>📭</div>
            <div style={{ color: colors.textMuted }}>
              No {selectedFilter !== 'all' ? selectedFilter : ''} transfers
            </div>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
          {items.map(item => (
            <Card key={item.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: `${space.md}px` }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text }}>
                    {item.amount} {item.token}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: `${space.xs}px` }}>
                    from {item.senderMasked}
                  </div>
                </div>
                <Badge variant={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>
              <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: `${space.md}px` }}>
                {item.timestamp}
              </div>
              {item.status === 'claimable' && (
                <Button 
                    variant="primary" 
                    size="sm" 
                    fullWidth 
                    onClick={handleClaim}
                    disabled={claiming}
                >
                  {claiming ? 'Claiming...' : 'Claim'}
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
