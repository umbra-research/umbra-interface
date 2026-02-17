import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { UmbraService } from '../services/umbra';
import { claimFunds } from '../lib/api';
import { StealthSignal } from '../types/umbra';

interface WithdrawalFormProps {
    items: StealthSignal[];
    identity: any; // { spendSecret, viewSecret, ... }
    onClaimSuccess?: () => void;
}

export const WithdrawForm: React.FC<WithdrawalFormProps> = ({ items, identity, onClaimSuccess }) => {
    const { publicKey } = useWallet();
    const [selectedSig, setSelectedSig] = useState<string>('');
    const [recipient, setRecipient] = useState<string>(publicKey ? publicKey.toBase58() : '');
    const [status, setStatus] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Filter only claimable items
    const claimableItems = items.filter(i => {
        const isPending = i.status === 'Pending';
        if (!isPending) console.log(`[WithdrawForm] Filtering out item ${i.id} with status:`, i.status);
        return isPending;
    });
    
    console.log("[WithdrawForm] All items:", items.length, "Claimable:", claimableItems.length);
    if (items.length > 0) console.log("[WithdrawForm] Sample item status:", items[0].status);

    // Hardcoded for demo/localnet
    const RELAYER_FEE = 1000;
    const RELAYER_URL = "http://localhost:8080/relay"; // Direct backend access

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSig || !recipient || !identity) return;

        const item = items.find(i => i.signature === selectedSig);
        if (!item) return;

        setIsProcessing(true);
        setStatus("Recovering Stealth Keys...");

        try {
            // 1. Recover Keys
            if (!identity.spendSecret) throw new Error("Missing spend secret");

            const { secret: stealthSecret, pubkey: stealthPubkey } = await UmbraService.recoverStealthSecret(
                identity.viewSecret,
                identity.spendSecret,
                item.ephemeral_pubkey
            );

            // 2. Sign Relayer Request
            const amount = 0; 
            const toLeHex = (num: number, bytes: number) => {
                const buf = Buffer.alloc(bytes);
                buf.writeBigUInt64LE(BigInt(num), 0);
                return buf.toString('hex');
            };

            const recipientBytes = new Uint8Array(Buffer.from(new (await import('@solana/web3.js')).PublicKey(recipient).toBytes()));
            const recipientHex = Buffer.from(recipientBytes).toString('hex');
            
            const amountHex = toLeHex(amount, 8);
            const feeHex = toLeHex(RELAYER_FEE, 8);
            
            const messageHex = stealthPubkey + recipientHex + amountHex + feeHex;
            
            setStatus("Signing Request...");
            const signature = await UmbraService.signRelayerRequest(stealthSecret, messageHex);

            setStatus("Relaying...");
            const payload = {
                stealth_pubkey: new (await import('@solana/web3.js')).PublicKey(Buffer.from(stealthPubkey, 'hex')).toBase58(),
                recipient_pubkey: recipient,
                amount: amount,
                relayer_fee: RELAYER_FEE,
                signature: signature
            };

            const res = await fetch(RELAYER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Check network failure
            if (!res.ok) {
                const err = await res.text();
                // Try parse JSON error if possible
                try {
                    const jsonErr = JSON.parse(err);
                    throw new Error(jsonErr.error || jsonErr.status || "Relay failed");
                } catch {
                    throw new Error("Relay failed: " + err);
                }
            }

            const data = await res.json();
            
            // Check application failure (200 OK but status: failed)
            if (data.status === 'failed') {
                throw new Error(data.error || "Relay returned failure status");
            }

            console.log("Relay success:", data);
            
            // 3. Mark as claimed in backend (Optimistic UI update triggered by onClaimSuccess refresh)
            setStatus("Marking as Claimed...");
            await claimFunds(item.id, recipient);
            
            setStatus("Success! Funds withdrawn.");
            setSelectedSig('');
            
            // Trigger refresh
            if (onClaimSuccess) onClaimSuccess();

        } catch (e: any) {
            console.error(e);
            setStatus("Error: " + e.message);
            // We do not revert optimistic state here because we didn't mutate 'items' locally yet.
            // We rely on 'onClaimSuccess' to re-fetch.
            // If we had redundant local state, we'd revert it here.
        } finally {
            setIsProcessing(false);
        }
    };


    return (
        <form onSubmit={handleWithdraw} className="space-y-6 animate-in fade-in duration-700">
            <div className="space-y-2">
                <label className="text-amber-500/50 text-xs font-mono uppercase tracking-widest">Select Signal</label>
                <select 
                    value={selectedSig}
                    onChange={(e) => {
                        console.log("Selected sig:", e.target.value);
                        setSelectedSig(e.target.value);
                    }}
                    className="w-full bg-[#0F0F0F] border border-amber-900/30 text-amber-100 p-4 focus:outline-none focus:border-amber-500/50 active:scale-[0.99] transition-all font-mono text-sm"
                >
                    <option value="">-- Select a Stealth Payment --</option>
                    {claimableItems.map((item, i) => (
                        <option key={i} value={item.signature}>
                            {new Date(item.timestamp).toLocaleString()} - {item.plaintext} ({item.status})
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-amber-500/50 text-xs font-mono uppercase tracking-widest">Destined Recipient</label>
                <input 
                    type="text" 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Solana Address"
                    className="w-full bg-[#0F0F0F] border border-amber-900/30 text-amber-100 p-4 focus:outline-none focus:border-amber-500/50 active:scale-[0.99] transition-all font-mono"
                />
            </div>

            <button 
                type="submit" 
                disabled={isProcessing || !selectedSig}
                className="w-full bg-amber-500/10 border border-amber-500/50 text-amber-500 p-4 font-cinzel hover:bg-amber-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? 'PROCESSING...' : 'WITHDRAW FUNDS'}
            </button>
            
            {status && (
                <div className={`text-xs font-mono text-center mt-4 ${status.includes("Error") ? "text-red-500" : "text-green-500"}`}>
                    {status}
                </div>
            )}
        </form>
    );
};
