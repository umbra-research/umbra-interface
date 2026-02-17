'use client';

import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { BackendService } from '../services/backend';
import { colors, space, radii, typography, motion } from '../theme';

type SendStep = 'input' | 'review' | 'processing' | 'done';

interface ProcessingState {
  buildTx: 'pending' | 'active' | 'done' | 'error';
  sign: 'pending' | 'active' | 'done' | 'error';
  confirm: 'pending' | 'active' | 'done' | 'error';
}

export const SendForm = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [step, setStep] = useState<SendStep>('input');
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    buildTx: 'pending', sign: 'pending', confirm: 'pending'
  });

  const lamports = Math.floor(parseFloat(amount || '0') * 1_000_000_000);
  const isValid = publicKey && recipient.includes(':') && parseFloat(amount) > 0;

  const handleReview = () => {
    if (!isValid) return;
    setStep('review');
    setError(null);
  };

  const handleBack = () => {
    setStep('input');
    setError(null);
  };

  const handleSend = async () => {
    if (!publicKey || !isValid) return;
    setStep('processing');
    setError(null);
    setProcessing({ buildTx: 'active', sign: 'pending', confirm: 'pending' });

    try {
      // Step 1: Build transaction
      const transaction = await BackendService.createSendTransaction({
        payer: publicKey.toBase58(),
        recipient,
        amount: lamports,
        token: 'SOL',
        memo: memo || undefined,
      });
      setProcessing(p => ({ ...p, buildTx: 'done', sign: 'active' }));

      // Step 2: Sign in wallet
      const sig = await sendTransaction(transaction, connection);
      setTxSig(sig);
      setProcessing(p => ({ ...p, sign: 'done', confirm: 'active' }));

      // Step 3: Confirm on-chain
      await connection.confirmTransaction(sig, 'confirmed');
      setProcessing(p => ({ ...p, confirm: 'done' }));
      setStep('done');

    } catch (e: any) {
      console.error('Payment failed:', e);
      setError(e.message || 'Transaction failed');
      setProcessing(prev => {
        const updated = { ...prev };
        if (updated.buildTx === 'active') updated.buildTx = 'error';
        if (updated.sign === 'active') updated.sign = 'error';
        if (updated.confirm === 'active') updated.confirm = 'error';
        return updated;
      });
    }
  };

  const handleReset = () => {
    setStep('input');
    setRecipient('');
    setAmount('');
    setMemo('');
    setTxSig(null);
    setError(null);
    setProcessing({ buildTx: 'pending', sign: 'pending', confirm: 'pending' });
  };

  // ── Step 1: Input ──
  if (step === 'input') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
        <FormField label="Recipient Stealth Address">
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="viewPub:spendPub"
            style={inputStyle}
          />
          {recipient && !recipient.includes(':') && (
            <div style={{ fontSize: '11px', color: colors.warning, marginTop: '4px' }}>
              Format: viewPublicKey:spendPublicKey
            </div>
          )}
        </FormField>

        <FormField label="Amount (SOL)">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.001"
            min="0"
            style={inputStyle}
          />
        </FormField>

        <FormField label="Memo (optional, encrypted)">
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Payment reference or note"
            style={inputStyle}
          />
          <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '4px' }}>
            🔒 Encrypted — only the recipient can read this
          </div>
        </FormField>

        <button
          onClick={handleReview}
          disabled={!isValid}
          style={{
            ...buttonStyle,
            background: isValid ? colors.accentGradient : colors.surface2,
            color: isValid ? colors.accentContrast : colors.textMuted,
            cursor: isValid ? 'pointer' : 'not-allowed',
            opacity: isValid ? 1 : 0.5,
          }}
        >
          Review Transaction →
        </button>
      </div>
    );
  }

  // ── Step 2: Review ──
  if (step === 'review') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
        <div style={{ textAlign: 'center', marginBottom: `${space.sm}px` }}>
          <div style={{ ...typography.h3, color: colors.text }}>Review Transaction</div>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>Verify details before signing</div>
        </div>

        <ReviewRow label="To" value={`${recipient.slice(0, 16)}...${recipient.slice(-8)}`} />
        <ReviewRow label="Amount" value={`${amount} SOL`} highlight />
        <ReviewRow label="Network Fee" value="~0.000005 SOL" />
        {memo && <ReviewRow label="Memo" value={memo} />}
        
        <div style={{
          padding: `${space.sm}px ${space.md}px`,
          background: colors.successLight,
          borderRadius: radii.sm,
          border: `1px solid ${colors.success}20`,
          fontSize: '11px',
          color: colors.success,
          textAlign: 'center',
        }}>
          🔐 Privacy guarantee: Transaction will be sent to a stealth address. 
          On-chain observers cannot link sender to receiver.
        </div>

        <div style={{ display: 'flex', gap: `${space.sm}px` }}>
          <button onClick={handleBack} style={{ ...buttonStyle, flex: 0, padding: `0 ${space.lg}px`, background: colors.surface2, color: colors.textSecondary }}>
            ← Back
          </button>
          <button onClick={handleSend} style={{ ...buttonStyle, flex: 1, background: colors.accentGradient, color: colors.accentContrast }}>
            Confirm & Sign
          </button>
        </div>
      </div>
    );
  }

  // ── Step 3: Processing ──
  if (step === 'processing') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px`, padding: `${space.md}px 0` }}>
        <div style={{ textAlign: 'center', marginBottom: `${space.sm}px` }}>
          <div style={{ fontSize: '40px', marginBottom: `${space.sm}px` }}>
            {error ? '⚠️' : '⟳'}
          </div>
          <div style={{ ...typography.h3, color: error ? colors.danger : colors.text }}>
            {error ? 'Transaction Failed' : 'Processing...'}
          </div>
        </div>

        <ProcessingStep label="Building stealth address" status={processing.buildTx} />
        <ProcessingStep label="Waiting for wallet signature" status={processing.sign} />
        <ProcessingStep label="Confirming on-chain" status={processing.confirm} />

        {error && (
          <div style={{
            padding: `${space.md}px`,
            background: colors.dangerLight,
            borderRadius: radii.sm,
            border: `1px solid ${colors.danger}20`,
            fontSize: '12px',
            color: colors.danger,
            wordBreak: 'break-word',
          }}>
            {error}
          </div>
        )}

        {error && (
          <button onClick={handleReset} style={{ ...buttonStyle, background: colors.surface2, color: colors.text }}>
            ← Try Again
          </button>
        )}
      </div>
    );
  }

  // ── Step 4: Done ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px`, padding: `${space.md}px 0`, textAlign: 'center' }}>
      <div style={{ fontSize: '48px' }}>✅</div>
      <div style={{ ...typography.h3, color: colors.success }}>Payment Sent!</div>
      <div style={{ fontSize: '13px', color: colors.textSecondary }}>
        {amount} SOL sent privately via stealth address
      </div>

      {txSig && (
        <div style={{
          padding: `${space.md}px`,
          background: colors.surface,
          borderRadius: radii.sm,
          border: `1px solid ${colors.border}`,
        }}>
          <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '4px' }}>Transaction Signature</div>
          <div style={{
            fontFamily: typography.fontMono,
            fontSize: '11px',
            color: colors.text,
            wordBreak: 'break-all',
          }}>
            {txSig}
          </div>
          <a
            href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '11px', color: colors.accent, display: 'block', marginTop: `${space.sm}px` }}
          >
            View on Solana Explorer →
          </a>
        </div>
      )}

      <button onClick={handleReset} style={{ ...buttonStyle, background: colors.accentGradient, color: colors.accentContrast }}>
        Send Another Payment
      </button>
    </div>
  );
};

// ─────────────────── Sub-Components ───────────────────

const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label style={{
      display: 'block',
      fontSize: '11px',
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: `${space.xs}px`,
    }}>
      {label}
    </label>
    {children}
  </div>
);

const ReviewRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${space.sm}px ${space.md}px`,
    background: colors.surface,
    borderRadius: radii.sm,
    border: `1px solid ${colors.border}`,
  }}>
    <span style={{ fontSize: '12px', color: colors.textMuted }}>{label}</span>
    <span style={{ 
      fontSize: highlight ? '16px' : '13px', 
      fontWeight: highlight ? '700' : '500',
      color: highlight ? colors.accent : colors.text,
      fontFamily: typography.fontMono,
    }}>
      {value}
    </span>
  </div>
);

const ProcessingStep = ({ label, status }: { label: string; status: string }) => {
  const icon = status === 'done' ? '✅' : status === 'active' ? '⟳' : status === 'error' ? '❌' : '○';
  const color = status === 'done' ? colors.success : status === 'active' ? colors.accent : status === 'error' ? colors.danger : colors.textMuted;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: `${space.md}px`,
      padding: `${space.sm}px ${space.md}px`,
      background: status === 'active' ? colors.surface2 : 'transparent',
      borderRadius: radii.sm,
      transition: motion.fast,
    }}>
      <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>{icon}</span>
      <span style={{ fontSize: '13px', color, fontWeight: status === 'active' ? '600' : '400' }}>
        {label}
      </span>
    </div>
  );
};

// ─────────────────── Styles ───────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: `${space.md}px`,
  background: colors.surface,
  border: `1px solid ${colors.border2}`,
  borderRadius: radii.sm,
  color: colors.text,
  fontFamily: typography.fontMono,
  fontSize: '13px',
  outline: 'none',
  transition: motion.fast,
  boxSizing: 'border-box',
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: `${space.md}px`,
  border: 'none',
  borderRadius: radii.md,
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: motion.fast,
  fontFamily: typography.fontBody,
};
