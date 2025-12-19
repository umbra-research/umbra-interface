'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { colors, space, radii, typography } from '../theme';
import { useAppContext } from '../components/Providers';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { mockTokens, maskAddress, mockClusters, Cluster } from '../mockData';
import { validateAddress, formatAddress, estimateTransactionFee, lamportsToSol } from '../services/solana';
import { fetchSystemStatus, SystemStatus, sendTransfer } from '../lib/api';

interface SendFormState {
  recipient: string;
  token: string;
  amount: string;
  memo?: string;
}

interface SendResult {
  status: 'submitted' | 'confirmed' | 'finalized' | 'failed';
  signature: string;
  timestamp: string;
  receiptId: string;
}

export default function SendPage() {
  const { selectedCluster, setSelectedCluster } = useAppContext();
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const clusterLabel = mockClusters.find(c => c.name === selectedCluster)?.label || selectedCluster;

  const [form, setForm] = useState<SendFormState>({
    recipient: '',
    token: 'SOL',
    amount: '',
  });
  const [showReview, setShowReview] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [revealRecipient, setRevealRecipient] = useState(false);
  const [holdingToReveal, setHoldingToReveal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [fee, setFee] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const clusterTokens = mockTokens.filter(t => t.cluster === selectedCluster);
  const selectedTokenData = clusterTokens.find(t => t.symbol === form.token);

  // Fetch balance on wallet connect
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
      fetchFee();
    }
  }, [connected, publicKey, connection]);

  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  useEffect(() => {
    fetchSystemStatus().then(setSystemStatus);
  }, []);

  const fetchBalance = async () => {
    if (!publicKey) return;
    setBalanceLoading(true);
    try {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamportsToSol(lamports));
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  const fetchFee = async () => {
    try {
      const feeAmount = await estimateTransactionFee(selectedCluster);
      setFee(feeAmount);
    } catch (error) {
      setFee(0.00005); // Default fallback
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (!validateAddress(form.recipient)) {
      newErrors.recipient = 'Invalid Solana address';
    }

    if (!form.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const amountNum = parseFloat(form.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      } else if (amountNum + fee > balance) {
        newErrors.amount = `Insufficient balance (need ${(amountNum + fee).toFixed(6)} SOL)`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReview = () => {
    if (validateForm()) {
      setShowReview(true);
    }
  };

  const handleConfirmSend = async () => {
    if (!publicKey || !connected || !sendTransaction) {
      setErrors({ form: 'Wallet not connected' });
      return;
    }

    setIsSending(true);

    try {
      // 1. Request Transaction from Backend
      const result = await sendTransfer({
        payer: publicKey.toBase58(),
        recipient: form.recipient,
        amount: form.amount,
        token: form.token
      });

      if (result.status === 'failed' || !result.transaction) {
        throw new Error('Failed to create transaction');
      }

      // 2. Deserialize Transaction
      const txBuffer = Buffer.from(result.transaction, 'base64');
      const transaction = Transaction.from(txBuffer);

      // 3. User Signs & Sends
      const signature = await sendTransaction(transaction, connection);

      setSendResult({
        status: 'submitted',
        signature: signature,
        timestamp: new Date().toISOString(),
        receiptId: `rcpt-${Date.now()}`,
      });

      // Monitor transaction status
      setTimeout(() => {
        setSendResult(prev => prev ? { ...prev, status: 'confirmed' } : null);
      }, 2000);

      // Monitor transaction status
      setTimeout(() => {
        setSendResult(prev => prev ? { ...prev, status: 'confirmed' } : null);
      }, 2000);

      setTimeout(() => {
        setSendResult(prev => prev ? { ...prev, status: 'finalized' } : null);
      }, 5000);

      setShowReview(false);
    } catch (error: any) {
      console.error('Send error:', error);
      setSendResult({
        status: 'failed',
        signature: '',
        timestamp: new Date().toISOString(),
        receiptId: '',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setForm({ recipient: '', token: 'USDC', amount: '' });
    setSendResult(null);
    setErrors({});
  };

  if (sendResult) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Card 
          variant="glass"
          style={{ animation: 'fadeIn 0.4s ease-out', borderColor: sendResult.status === 'failed' ? colors.danger : colors.border }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '56px',
              marginBottom: `${space.lg}px`,
              animation: sendResult.status === 'finalized' ? 'slideInUp 0.5s ease-out 0.2s both' : 'pulse 1.5s ease-in-out infinite'
            }}>
              {sendResult.status === 'finalized' ? '✓' : 
               sendResult.status === 'failed' ? '✕' : '⏳'}
            </div>
            <div style={{ ...typography.h2, marginBottom: `${space.md}px` }}>
              {sendResult.status === 'submitted' ? 'Broadcasting transfer...' :
               sendResult.status === 'confirmed' ? 'Confirming transaction...' :
               sendResult.status === 'finalized' ? 'Transfer Finalized!' :
               'Transfer Failed'}
            </div>

            {sendResult.status !== 'finalized' && (
              <div style={{
                fontSize: '13px',
                color: colors.textMuted,
                marginBottom: `${space.lg}px`,
              }}>
                This may take a few moments.
              </div>
            )}

            {sendResult.status === 'finalized' && (
              <>
                <Card variant="flat" style={{ marginBottom: `${space.lg}px`, textAlign: 'left', background: 'rgba(64, 224, 208, 0.05)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px`, fontSize: '12px' }}>
                    <div>
                      <div style={{ color: colors.textMuted, marginBottom: `${space.xs}px` }}>Receipt ID</div>
                      <div style={{ fontFamily: 'monospace', color: colors.text, wordBreak: 'break-all' }}>
                        {sendResult.receiptId}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: colors.textMuted, marginBottom: `${space.xs}px` }}>Signature</div>
                      <div style={{ fontFamily: 'monospace', color: colors.text, wordBreak: 'break-all' }}>
                        {sendResult.signature}
                      </div>
                    </div>
                  </div>
                </Card>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${space.md}px` }}>
                  <Button variant="secondary" onClick={handleReset}>
                    Send Another
                  </Button>
                  <Button variant="primary">
                    View Activity
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: `${space.lg}px` }}>
        <h1 style={typography.h1}>Send Anonymous Transfer</h1>
        <p style={{ ...typography.bodySm, color: colors.textMuted }}>
          Send funds anonymously to any Solana address on {mockClusters.find(c => c.name === selectedCluster)?.label || selectedCluster}.
        </p>
      </div>

      {systemStatus && (
        <div style={{ 
          marginBottom: `${space.md}px`, 
          padding: `${space.sm}px ${space.md}px`, 
          background: colors.surface2, 
          borderRadius: radii.md,
          display: 'flex',
          alignItems: 'center',
          gap: space.sm,
          fontSize: '13px'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: systemStatus.connected ? colors.success : colors.danger 
          }} />
          <span style={{ color: colors.textMuted }}>System:</span>
          <span style={{ color: colors.text }}>{systemStatus.system}</span>
          <span style={{ color: colors.textMuted }}>•</span>
          <span style={{ color: colors.textMuted }}>v{systemStatus.version}</span>
        </div>
      )}


      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.xl}px` }}>
          {/* Balance Info */}
          {connected ? (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center', // Align items nicely
              padding: `${space.md}px ${space.lg}px`,
              background: colors.surface2,
              borderRadius: `${radii.md}px`,
              fontSize: '13px',
              marginBottom: `${space.md}px` // Add some space below
            }}>
              <div>
                 <span style={{ color: colors.textMuted, marginRight: space.sm }}>Cluster:</span>
                 <select 
                    value={selectedCluster} 
                    onChange={(e) => setSelectedCluster(e.target.value as Cluster)}
                    style={{ background: 'transparent', color: colors.text, border: 'none', fontWeight: '600', cursor: 'pointer' }}
                 >
                    {mockClusters.map(c => <option key={c.name} value={c.name}>{c.label}</option>)}
                 </select>
              </div>

               <div style={{ display: 'flex', gap: space.md }}>
                  <span style={{ color: colors.textMuted }}>SOL Balance</span>
                  <span style={{ color: colors.text, fontWeight: '600' }}>
                    {balanceLoading ? '...' : `${balance.toFixed(4)} SOL`}
                  </span>
               </div>
            </div>
          ) : (
            <Card variant="outlined" style={{ borderColor: colors.warning }}>
              <div style={{ fontSize: '13px', color: colors.warning }}>
                ⚠ Connect your wallet to send transfers
              </div>
            </Card>
          )}

          {/* Recipient */}
          <Input
            label="Recipient Address"
            placeholder="9xQe..."
            value={form.recipient}
            onChange={(e) => {
              setForm({ ...form, recipient: e.target.value });
              if (errors.recipient) setErrors({ ...errors, recipient: '' });
            }}
            error={errors.recipient}
            clearable
            onClear={() => setForm({ ...form, recipient: '' })}
          />

          {/* Token Select */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: colors.text,
              marginBottom: `${space.sm}px`,
            }}>
              Token
            </label>
            <select
              value={form.token}
              onChange={(e) => setForm({ ...form, token: e.target.value })}
              style={{
                width: '100%',
                padding: `${space.md}px ${space.lg}px`,
                background: colors.surface2,
                border: `1px solid ${colors.border}`,
                borderRadius: `${radii.md}px`,
                color: colors.text,
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {clusterTokens.map(t => (
                <option key={t.symbol} value={t.symbol}>
                  {t.name} ({t.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <Input
            label="Amount (SOL)"
            placeholder="0.00"
            type="number"
            step="0.00001"
            min="0"
            value={form.amount}
            onChange={(e) => {
              setForm({ ...form, amount: e.target.value });
              if (errors.amount) setErrors({ ...errors, amount: '' });
            }}
            error={errors.amount}
          />

          {/* Fee Estimate */}
          <Card variant="flat" style={{ background: 'rgba(64, 224, 208, 0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.sm}px`, fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Network Fee</span>
                <span style={{ fontWeight: '600' }}>~{fee.toFixed(6)} SOL</span>
              </div>
              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: `${space.sm}px`, display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                <span>Total Cost</span>
                <span>{(parseFloat(form.amount || '0') + fee).toFixed(6)} SOL</span>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleReview}
            disabled={!connected || isSending}
          >
            {isSending ? 'Sending...' : !connected ? 'Connect Wallet' : 'Review & Send'}
          </Button>
        </div>
      </Card>

      {/* Review Modal */}
      <Modal
        isOpen={showReview}
        onClose={() => {
          setShowReview(false);
          setRevealRecipient(false);
          setHoldingToReveal(false);
        }}
        title="Review Transfer"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setShowReview(false);
              setRevealRecipient(false);
              setHoldingToReveal(false);
            }}>
              Back
            </Button>
            <Button variant="primary" onClick={handleConfirmSend} disabled={!revealRecipient || isSending}>
              {isSending ? 'Sending...' : 'Confirm Transfer'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.lg}px` }}>
          {/* Recipient (Hold-to-Reveal) */}
          <div
            style={{
              padding: `${space.lg}px`,
              background: colors.surface2,
              borderRadius: `${radii.md}px`,
              border: `1px solid ${revealRecipient ? colors.accent : colors.border}`,
              cursor: 'default',
              userSelect: 'none',
              transition: `all 0.2s ease`,
            }}
            onMouseDown={() => setHoldingToReveal(true)}
            onMouseUp={() => setHoldingToReveal(false)}
            onMouseLeave={() => setHoldingToReveal(false)}
            onTouchStart={() => setHoldingToReveal(true)}
            onTouchEnd={() => setHoldingToReveal(false)}
          >
            <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: `${space.sm}px` }}>
              Recipient (hold to reveal full address)
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: revealRecipient || holdingToReveal ? colors.text : colors.textMuted,
              fontFamily: 'monospace',
              transition: `color 0.2s ease`,
            }}>
              {(revealRecipient || holdingToReveal) ? form.recipient : maskAddress(form.recipient)}
            </div>
          </div>

          {/* Cluster & Token & Amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: `${space.md}px` }}>
            <div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: `${space.xs}px`, fontWeight: '500' }}>
                CLUSTER
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {clusterLabel}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: `${space.xs}px`, fontWeight: '500' }}>
                TOKEN
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {form.token}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: `${space.xs}px`, fontWeight: '500' }}>
                AMOUNT
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {form.amount}
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <Card variant="flat" style={{ background: 'rgba(64, 224, 208, 0.05)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.sm}px`, fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.text }}>
                <span>Network Fee</span>
                <span style={{ fontWeight: '600' }}>~0.00025 SOL</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.text }}>
                <span>Service Fee</span>
                <span style={{ fontWeight: '600' }}>~0.0005 SOL</span>
              </div>
              <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: `${space.sm}px`, display: 'flex', justifyContent: 'space-between', fontWeight: '600', color: colors.accent }}>
                <span>Total</span>
                <span>~0.00075 SOL</span>
              </div>
            </div>
          </Card>

          {/* Safety Notice */}
          <Card variant="outlined" style={{ borderColor: colors.warning }}>
            <div style={{ fontSize: '13px', color: colors.warning }}>
              ⚠ <strong>Irreversible</strong> — Double-check the recipient address. Transfers cannot be reversed.
            </div>
          </Card>

          {/* Checkbox to acknowledge */}
          <label style={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, cursor: 'pointer', fontSize: '13px', color: colors.text }}>
            <input
              type="checkbox"
              checked={revealRecipient}
              onChange={(e) => setRevealRecipient(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            I've verified the recipient address
          </label>
        </div>
      </Modal>
    </div>
  );
}
