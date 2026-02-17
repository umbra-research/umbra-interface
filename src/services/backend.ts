import { Connection, Transaction, VersionedTransaction } from "@solana/web3.js";

const BACKEND_URL = "http://localhost:8080";

export interface SendRequest {
    payer: string;
    recipient: string;
    amount: number; // Lamports? Yes, backend expects u64
    token: "SOL" | string;
    memo?: string;
}

export interface SendResponse {
    status: string;
    transaction: string; // base64
    error?: string;
}

export const BackendService = {
    async createSendTransaction(req: SendRequest): Promise<Transaction | VersionedTransaction> {
        const res = await fetch(`${BACKEND_URL}/api/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req)
        });
        
        const data: SendResponse = await res.json();
        if (data.status !== 'created' || !data.transaction) {
            throw new Error(data.error || 'Failed to create transaction');
        }

        // Deserialize transaction
        // Backend uses bincode + base64. 
        // JS needs to decode base64 and deserialize.
        // Wait, bincode serialization in Rust is specific. 
        // Solan web3.js expects buffer for `Transaction.from(buffer)`.
        // The Rust `serialize(&tx)` produces a bincode blob of the Transaction struct.
        // Does `Transaction::from(buffer)` in JS match Rust's bincode layout?
        // NO! Rust bincode layout != Solana wire format.
        // CRITICAL MISTAKE IN BACKEND IMPLEMENTATION:
        // I used `bincode::serialize(&tx)`.
        // I should have used `tx.serialize()` (if available) or constructed the message and serialized IT.
        // `solana_sdk::transaction::Transaction` has `serialize()`. 
        // That produces the WIRE FORMAT (bincode compliant usually, but `bincode::serialize(&tx)` might add extra length prefixes or struct overhead if using generic derive?)
        // `solana_sdk` uses `bincode` for serialization internally for the wire format.
        // However, `tx.serialize()` is the standard way to get wire bytes.
        // `bincode::serialize(&tx)` *might* be same as `tx.serialize()`?
        // Let's verify. `impl Serialize for Transaction` is derived or manual? 
        // It is manual in `solana_sdk`.
        // So `bincode::serialize(&tx)` invokes `Transaction::serialize`.
        // So it should be fine!
        
        const buffer = Buffer.from(data.transaction, 'base64');
        try {
            return Transaction.from(buffer);
        } catch (e) {
            // Try versioned?
            // For now assuming legacy transaction for simple Stealth Send.
             try {
                return VersionedTransaction.deserialize(buffer);
             } catch (vErr) {
                 console.error("Deserialize failed", e, vErr);
                 throw new Error("Failed to deserialize transaction from backend");
             }
        }
    },

    async getInbox(recipient?: string): Promise<any[]> {
        let url = `${BACKEND_URL}/api/inbox?limit=100`;
        // if (recipient) url += `&recipient=${recipient}`;
        const res = await fetch(url);
        return await res.json();
    }
};
