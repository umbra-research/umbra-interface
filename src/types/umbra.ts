export type AnnouncementStatus = 'Pending' | 'Claimed';

// Matches backend TxRecord struct
export interface StealthSignal {
    id: string;
    timestamp: string;
    payer: string;
    recipient: string;
    amount: number;
    token: string;
    status: AnnouncementStatus | string; // Allow string for loose matching if casing varies, but should be exact
    signature: string;
    cipher_text: string;
    ephemeral_pubkey: string;
    hashed_tag: string;
    
    // Client-side computed properties
    plaintext?: string;
    is_claimable?: boolean;
}

// Runtime validator to ensuring backend response matches expected shape
export function validateSignal(data: any): StealthSignal {
    if (!data || typeof data !== 'object') {
        throw new Error("Invalid signal data: not an object");
    }
    
    // Basic field checks
    if (typeof data.id !== 'string') throw new Error(`Signal missing id: ${JSON.stringify(data)}`);
    if (typeof data.cipher_text !== 'string') throw new Error(`Signal missing cipher_text`);
    if (typeof data.ephemeral_pubkey !== 'string') throw new Error(`Signal missing ephemeral_pubkey`);
    
    // Normalize status if needed (backend serialized enum as lowercase string via encode?)
    // Our custom manual encode does "pending"/"claimed".
    // TxRecord status field was "AnnouncementStatus" which we implemented Encode for.
    // So it should be string "pending" or "claimed".
    
    let status = data.status;
    if (typeof status === 'string') {
        // Capitalize for UI consistency if needed, or keep lowercase
        // Let's normalize to Title Case for our TS type 'Pending' | 'Claimed' if we want strictly typed enum usage
        // Or just map it.
        if (status.toLowerCase() === 'pending' || status.toLowerCase() === 'claimable') status = 'Pending';
        else if (status.toLowerCase() === 'claimed') status = 'Claimed';
    }
    
    return {
        ...data,
        status: status as AnnouncementStatus
    };
}
