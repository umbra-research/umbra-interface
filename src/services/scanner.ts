import { Connection, PublicKey, ParsedTransactionWithMeta } from "@solana/web3.js";
import bs58 from "bs58";

export const PROGRAM_ID = new PublicKey("Umbra11111111111111111111111111111111111111");

// Event Discriminator: "event:StealthAnnouncement" -> sha256 -> first 8 bytes
// c5 55 53 cb 8e 58 05 b0
const ANNOUNCEMENT_DISCRIMINATOR = new Uint8Array([0xc5, 0x55, 0x53, 0xcb, 0x8e, 0x58, 0x05, 0xb0]);

export interface StealthAnnouncement {
    ephemeralPubkey: Uint8Array; // 32
    hashedTag: Uint8Array;       // 32
    ciphertext: Uint8Array;      // Vec<u8>
    tokenMint: PublicKey | null;
    signature: string;
    slot: number;
    timestamp: number;
}

export class ScannerService {
    connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    async scanRecent(limit: number = 20): Promise<StealthAnnouncement[]> {
        // Fetch recent signatures for the program
        const signatures = await this.connection.getSignaturesForAddress(PROGRAM_ID, { limit });
        const announcements: StealthAnnouncement[] = [];

        // Fetch parsed transactions
        // Note: getParsedTransactions is more efficient than getTransaction in loop, but limits apply.
        // We'll process in chunks if needed, but for 'recent' 20 is fine.
        const txs = await this.connection.getParsedTransactions(
            signatures.map(s => s.signature),
            { commitment: "confirmed", maxSupportedTransactionVersion: 0 }
        );

        for (const tx of txs) {
            if (!tx || !tx.meta || tx.meta.err) continue;
            
            const logs = tx.meta.logMessages || [];
            const signature = tx.transaction.signatures[0];
            const slot = tx.slot;
            const timestamp = tx.blockTime || 0;

            for (const log of logs) {
                if (log.startsWith("Program data: ")) {
                    const b64 = log.replace("Program data: ", "");
                    const data = Buffer.from(b64, "base64");
                    
                    if (this.isStealthAnnouncement(data)) {
                        try {
                            const event = this.parseAnnouncement(data, signature, slot, timestamp);
                            announcements.push(event);
                        } catch (e) {
                            console.error("Failed to parse announcement:", e);
                        }
                    }
                }
            }
        }

        return announcements;
    }

    private isStealthAnnouncement(data: Buffer): boolean {
        if (data.length < 8) return false;
        const disc = data.slice(0, 8);
        return Buffer.compare(disc, Buffer.from(ANNOUNCEMENT_DISCRIMINATOR)) === 0;
    }

    private parseAnnouncement(data: Buffer, signature: string, slot: number, timestamp: number): StealthAnnouncement {
        // Skip discriminator
        let offset = 8;
        
        // ephemeral_pubkey: [u8; 32]
        const ephemeralPubkey = new Uint8Array(data.slice(offset, offset + 32));
        offset += 32;

        // hashed_tag: [u8; 32]
        const hashedTag = new Uint8Array(data.slice(offset, offset + 32));
        offset += 32;

        // ciphertext: Vec<u8> (u32 len + bytes)
        const ciphertextLen = data.readUInt32LE(offset);
        offset += 4;
        const ciphertext = new Uint8Array(data.slice(offset, offset + ciphertextLen));
        offset += ciphertextLen;

        // token_mint: Option<Pubkey> (u8 + [u8; 32] if 1)
        let tokenMint: PublicKey | null = null;
        if (offset < data.length) {
            const hasMint = data[offset];
            offset += 1;
            if (hasMint === 1) {
                const mintBytes = data.slice(offset, offset + 32);
                tokenMint = new PublicKey(mintBytes);
                // offset += 32;
            }
        }

        return {
            ephemeralPubkey,
            hashedTag,
            ciphertext,
            tokenMint,
            signature,
            slot,
            timestamp
        };
    }
}
