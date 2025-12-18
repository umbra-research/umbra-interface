'use client';

import React, { useState } from 'react';
import { colors, space, radii, typography } from '../../theme';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { mockAddresses } from '../../mockData';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [showNew, setShowNew] = useState(false);

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
  };

  const handleEdit = (id: string, currentLabel: string) => {
    setEditingId(id);
    setEditLabel(currentLabel);
  };

  const handleSaveEdit = (id: string) => {
    setAddresses(addresses.map(a => 
      a.id === id ? { ...a, label: editLabel } : a
    ));
    setEditingId(null);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: `${space.lg}px` }}>
        <h1 style={typography.h1}>Addresses</h1>
        <p style={{ ...typography.bodySm, color: colors.textMuted }}>
          Manage your Solana addresses for receiving anonymous transfers.
        </p>
      </div>

      {/* Address List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px`, marginBottom: `${space.xl}px` }}>
        {addresses.map(addr => (
          <Card key={addr.id}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: `${space.md}px`,
            }}>
              <div style={{ flex: 1 }}>
                {editingId === addr.id ? (
                  <Input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="Label"
                    style={{ marginBottom: `${space.md}px` }}
                  />
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: `${space.md}px`, alignItems: 'center', marginBottom: `${space.sm}px` }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: colors.text }}>
                        {addr.label}
                      </div>
                      {addr.isDefault && <Badge size="sm">Default</Badge>}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: colors.textMuted,
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                    }}>
                      {addr.publicKeyMasked}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: colors.textMuted,
                      marginTop: `${space.sm}px`,
                    }}>
                      Created {addr.created}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: `${space.sm}px`, flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEdit(addr.id, addr.label)}
              >
                {editingId === addr.id ? 'Cancel' : 'Edit'}
              </Button>
              {editingId === addr.id && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSaveEdit(addr.id)}
                >
                  Save
                </Button>
              )}
              {!addr.isDefault && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSetDefault(addr.id)}
                >
                  Set Default
                </Button>
              )}
              <Button variant="ghost" size="sm">
                Copy Full Address
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Generate New */}
      <Card variant="glass">
        <div style={{ marginBottom: `${space.lg}px` }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: `${space.md}px` }}>
            Generate New Address
          </div>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: `${space.lg}px` }}>
            Create a new receiving address for better privacy. You can have multiple addresses active at once.
          </p>
          <Button variant="primary" fullWidth>
            Generate Address
          </Button>
        </div>
      </Card>

      {/* Security Section */}
      <Card style={{ marginTop: `${space.xl}px`, background: colors.surface2 }}>
        <div style={{ marginBottom: `${space.lg}px` }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: `${space.md}px` }}>
            Security & Backup
          </div>
          <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: `${space.lg}px` }}>
            Your addresses are derived from your private key. Keep your seed phrase secure and never share it.
          </p>
          <Button variant="secondary" fullWidth>
            Export Private Key (Advanced)
          </Button>
        </div>
      </Card>
    </div>
  );
}
