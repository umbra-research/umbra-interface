'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { colors, space, radii, typography } from '../../../theme';
import { useAppContext } from '../../../components/Providers';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Modal } from '../../../components/Modal';
import { mockInboxItems, mockAddresses, maskAddress } from '../../../mockData';

type ClaimStep = 'destination' | 'review' | 'confirm' | 'result';

interface ClaimState {
  step: ClaimStep;
  destination: string;
  customDestination: boolean;
  mode: 'standard' | 'relayer';
  status: 'idle' | 'claiming' | 'claimed' | 'failed';
  signature?: string;
}

export default function ClaimPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const router = useRouter();
  const { wallet } = useAppContext();
  const [claim, setClaim] = useState<ClaimState>({
    step: 'destination',
    destination: wallet.publicKey,
    customDestination: false,
    mode: 'standard',
    status: 'idle',
  });

  const inboxItem = mockInboxItems.find(i => i.id === id);
  if (!inboxItem) return <div>Item not found</div>;

  const defaultAddr = mockAddresses.find(a => a.isDefault);

  const handleDestinationNext = () => {
    if (!claim.destination.trim()) {
      alert('Please enter a destination address');
      return;
    }
    setClaim({ ...claim, step: 'review' });
  };

  const handleReviewNext = () => {
    setClaim({ ...claim, step: 'confirm' });
  };

  const handleConfirmClaim = async () => {
    setClaim({ ...claim, status: 'claiming' });

    // Simulate claim process
    setTimeout(() => {
      const signature = Math.random().toString(36).substring(2, 88) + Math.random().toString(36).substring(2, 10);
      setClaim(prev => ({ 
        ...prev, 
        status: 'claimed',
        signature: signature,
        step: 'result',
      }));
    }, 2000);
  };

  const handleBack = () => {
    if (claim.step !== 'destination') {
      setClaim({ ...claim, step: claim.step === 'review' ? 'destination' : 'review' });
    } else {
      router.push('/inbox');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Progress Indicator */}
      <div style={{ marginBottom: `${space.xl}px` }}>
        <div style={{ display: 'flex', gap: `${space.md}px`, marginBottom: `${space.lg}px` }}>
          {(['destination', 'review', 'confirm'] as const).map((s, idx) => (
            <React.Fragment key={s}>
              <div style={{
                flex: 1,
                height: '4px',
                background: claim.step === s || 
                  (['review', 'confirm'].includes(claim.step) && idx === 0) ||
                  (claim.step === 'confirm' && idx < 2) ? colors.accent : colors.border,
                borderRadius: `${radii.sm}px`,
                transition: 'all 0.3s ease',
              }} />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Transfer Details Header */}
      <Card style={{ marginBottom: `${space.lg}px`, background: colors.surface2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: `${space.xs}px` }}>
              You are claiming
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: colors.text }}>
              {inboxItem.amount} {inboxItem.token}
            </div>
          </div>
          <Badge variant="success">{inboxItem.status}</Badge>
        </div>
      </Card>

      {/* Step Content */}
      {claim.step === 'destination' && (
        <Card style={{ marginBottom: `${space.lg}px` }}>
          <div style={{ marginBottom: `${space.xl}px` }}>
            <h2 style={{ ...typography.h2, marginBottom: `${space.lg}px` }}>Step 1: Destination</h2>
            <p style={{ ...typography.bodySm, color: colors.textMuted, marginBottom: `${space.lg}px` }}>
              Where should we send the claimed funds?
            </p>

            <div style={{ marginBottom: `${space.lg}px` }}>
              <Button
                variant={claim.customDestination ? 'secondary' : 'primary'}
                fullWidth
                onClick={() => setClaim({ ...claim, customDestination: false, destination: wallet.publicKey })}
                style={{ marginBottom: `${space.md}px` }}
              >
                Use Connected Wallet
              </Button>
              <div style={{ fontSize: '12px', color: colors.textMuted, textAlign: 'center' }}>
                {maskAddress(wallet.publicKey)}
              </div>
            </div>

            <div style={{ 
              borderTop: `1px solid ${colors.border}`,
              borderBottom: `1px solid ${colors.border}`,
              padding: `${space.lg}px 0`,
              marginBottom: `${space.lg}px`,
              textAlign: 'center',
              color: colors.textMuted,
            }}>
              OR
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: `${space.sm}px`, color: colors.textMuted }}>
                Custom Address
              </label>
              <Input
                placeholder="9xQe..."
                value={claim.customDestination ? claim.destination : ''}
                onChange={(e) => setClaim({ ...claim, destination: e.target.value, customDestination: true })}
                disabled={!claim.customDestination}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: `${space.md}px` }}>
            <Button variant="secondary" fullWidth onClick={handleBack}>
              Back
            </Button>
            <Button variant="primary" fullWidth onClick={handleDestinationNext}>
              Next
            </Button>
          </div>
        </Card>
      )}

      {claim.step === 'review' && (
        <Card style={{ marginBottom: `${space.lg}px` }}>
          <div style={{ marginBottom: `${space.xl}px` }}>
            <h2 style={{ ...typography.h2, marginBottom: `${space.lg}px` }}>Step 2: Review</h2>

            <div style={{
              padding: `${space.lg}px`,
              background: colors.surface2,
              borderRadius: `${radii.md}px`,
              marginBottom: `${space.lg}px`,
            }}>
              <div style={{ marginBottom: `${space.lg}px` }}>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: `${space.sm}px` }}>
                  Destination (encrypted)
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: colors.text }}>
                  {maskAddress(claim.destination)}
                </div>
              </div>

              <div style={{ marginBottom: `${space.lg}px` }}>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: `${space.sm}px` }}>
                  Amount
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: colors.text }}>
                  {inboxItem.amount} {inboxItem.token}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: `${space.sm}px` }}>
                  Estimated Fee
                </div>
                <div style={{ fontSize: '14px', color: colors.text }}>
                  ~0.00025 SOL
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: `${space.md}px` }}>
              <Button variant="secondary" fullWidth onClick={handleBack}>
                Back
              </Button>
              <Button variant="primary" fullWidth onClick={handleReviewNext}>
                Confirm Claim
              </Button>
            </div>
          </div>
        </Card>
      )}

      {claim.step === 'confirm' && (
        <Card style={{ marginBottom: `${space.lg}px` }}>
          <div style={{ marginBottom: `${space.xl}px` }}>
            <h2 style={{ ...typography.h2, marginBottom: `${space.lg}px` }}>Step 3: Confirm</h2>

            {claim.status === 'idle' && (
              <div>
                <Card variant="outlined" style={{ marginBottom: `${space.lg}px`, borderColor: colors.warning }}>
                  <div style={{ fontSize: '13px', color: colors.warning }}>
                    ⚠ Verify the destination address carefully. This action cannot be undone.
                  </div>
                </Card>

                <Button variant="primary" fullWidth onClick={handleConfirmClaim}>
                  Execute Claim
                </Button>
              </div>
            )}

            {claim.status === 'claiming' && (
              <div style={{ textAlign: 'center', padding: `${space.xl}px` }}>
                <div style={{ fontSize: '36px', marginBottom: `${space.lg}px` }}>⏳</div>
                <div style={{ ...typography.body, color: colors.textMuted }}>
                  Processing your claim...
                </div>
              </div>
            )}

            {claim.status === 'claimed' && (
              <div style={{ textAlign: 'center', padding: `${space.xl}px` }}>
                <div style={{ fontSize: '36px', marginBottom: `${space.lg}px` }}>✓</div>
                <div style={{ ...typography.h2, marginBottom: `${space.md}px` }}>
                  Transfer Claimed!
                </div>
                <div style={{
                  background: colors.surface2,
                  padding: `${space.lg}px`,
                  borderRadius: `${radii.md}px`,
                  marginBottom: `${space.lg}px`,
                  fontSize: '11px',
                  color: colors.textMuted,
                  wordBreak: 'break-all',
                }}>
                  <div style={{ marginBottom: `${space.sm}px` }}>
                    <strong>Signature:</strong> {claim.signature}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: `${space.md}px` }}>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => router.push('/inbox')}
                  >
                    Back to Inbox
                  </Button>
                  <Button variant="primary" fullWidth>
                    View in Activity
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
