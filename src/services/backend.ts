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
        // Deserialize transaction: Backend returns base64 string
        const buffer = Buffer.from(data.transaction, 'base64');
        try {
            return Transaction.from(buffer);
        } catch (e) {
            // Try versioned?
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
