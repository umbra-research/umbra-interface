import { PublicKey } from '@solana/web3.js';

export interface RelayRequest {
  stealth_pubkey: string;
  recipient_pubkey: string;
  amount: number; // u64 likely handled as number in JS safely up to 2^53, but for strict u64 string might be safer. Backend parse u64 from json number or string. Axum json handles number.
  relayer_fee: number;
  signature: string; // Base64 encoded
}

export interface RelayResponse {
  tx_signature: string;
}

const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL || 'http://localhost:3000';

export class RelayerClient {
  static async relay(request: RelayRequest): Promise<RelayResponse> {
    const res = await fetch(`${RELAYER_URL}/relay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Relayer failed: ${res.statusText} - ${text}`);
    }

    return await res.json();
  }

  static createMessage(
    stealthPubkey: PublicKey,
    recipientPubkey: PublicKey,
    amount: bigint,
    fee: bigint
  ): Uint8Array {
     // Message format matches backend manual construction:
     // stealth_pubkey (32) || recipient_pubkey (32) || amount (8 le) || fee (8 le)
     
     const msg = new Uint8Array(32 + 32 + 8 + 8);
     msg.set(stealthPubkey.toBuffer(), 0);
     msg.set(recipientPubkey.toBuffer(), 32);
     
     const amountBuf = Buffer.alloc(8);
     amountBuf.writeBigUInt64LE(amount);
     msg.set(amountBuf, 64);
     
     const feeBuf = Buffer.alloc(8);
     feeBuf.writeBigUInt64LE(fee);
     msg.set(feeBuf, 72);
     
     return msg;
  }
}
