import React, { useState } from 'react';
import { useUmbra } from '../hooks/useUmbra';
import { colors, radii, space, typography } from '../theme';
import { Button } from './Button';
import { Card } from './Card';

export const StealthIdentityCard: React.FC = () => {
  const { isReady, generateIdentity, error } = useUmbra();
  const [keys, setKeys] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!isReady) return;
    setIsGenerating(true);
    try {
        const k = await generateIdentity();
        setKeys(k);
    } catch(e) {
        console.error(e);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Card>
        <div style={{ marginBottom: `${space.md}px` }}>
             <h2 style={{ ...typography.h3, color: colors.accent, marginBottom: `${space.xs}px` }}>
                Stealth Identity
             </h2>
             <p style={{ ...typography.bodySm, color: colors.textMuted }}>
                Generate your cryptographic identity to receive private transaction.
                <br/>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>
                     {error ? `Status: ${error}` : isReady ? '● Crypto Engine Ready' : '○ Initializing...'}
                </span>
             </p>
        </div>

        {!keys ? (
            <div style={{  display: 'flex', justifyContent: 'center', padding: `${space.lg}px 0` }}>
                 <Button 
                    onClick={handleGenerate} 
                    disabled={!isReady || isGenerating}
                    variant="primary"
                 >
                    {isGenerating ? 'Computing ZK Keys...' : 'Generate New Identity'}
                 </Button>
            </div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
                 {/* Public Keys */}
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${space.md}px` }}>
                    <KeyField label="Spend Public Key" value={keys.spendPub} />
                    <KeyField label="View Public Key" value={keys.viewPub} />
                 </div>

                 {/* Private Keys (Blurred) */}
                 <div style={{ paddingTop: `${space.md}px`, borderTop: `1px solid ${colors.border}` }}>
                     <div style={{ 
                         fontSize: '11px', 
                         fontWeight: 'bold', 
                         color: colors.danger, 
                         marginBottom: `${space.sm}px`,
                         letterSpacing: '1px'
                     }}>
                        PRIVATE SECRETS (DO NOT SHARE)
                     </div>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: `${space.sm}px` }}>
                        <SecretField label="Private Spend Key" value={keys.spendSecret} />
                        <SecretField label="Private View Key" value={keys.viewSecret} />
                     </div>
                 </div>

                 <Button variant="secondary" size="sm" onClick={handleGenerate} style={{ marginTop: `${space.sm}px` }}>
                    Regenerate
                 </Button>
            </div>
        )}
    </Card>
  );
};

const KeyField = ({ label, value }: { label: string, value: string }) => (
    <div>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: colors.textMuted, marginBottom: '4px' }}>
            {label}
        </div>
        <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '12px', 
            background: 'rgba(0,0,0,0.3)', 
            padding: '8px', 
            borderRadius: '4px',
            wordBreak: 'break-all',
            color: colors.text
        }}>
            {value}
        </div>
    </div>
);

const SecretField = ({ label, value }: { label: string, value: string }) => (
    <div style={{ position: 'relative' }}>
        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: colors.danger, marginBottom: '4px' }}>
            {label}
        </div>
        <div className="group" style={{ position: 'relative' }}>
            <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '12px', 
                background: 'rgba(50,0,0,0.1)', 
                border: `1px solid ${colors.danger}30`,
                padding: '8px', 
                borderRadius: '4px',
                wordBreak: 'break-all',
                color: colors.danger,
                filter: 'blur(4px)',
                cursor: 'pointer',
                transition: 'filter 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'none'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'blur(4px)'}
            >
                {value}
            </div>
        </div>
    </div>
);
