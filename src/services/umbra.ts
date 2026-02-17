import type { UmbraIdentity } from '../../../umbra/crates/wasm/pkg/umbra_wasm';
import { PublicKey, TransactionInstruction, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { Buffer } from 'buffer';

export const UMBRA_PROGRAM_ID = new PublicKey('2L2TivMpeKJotzaHuQPUHDgfKaPwrvL5uGuhRw6dju96');

const hexToBytes = (hex: string): Uint8Array => {
    if (hex.startsWith('0x')) hex = hex.slice(2);
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
};

// Dynamically import WASM module
const wasmPromise = import('../../../umbra/crates/wasm/pkg/umbra_wasm');

export const UmbraService = {
  async init() {
    const wasmModule = await wasmPromise;
    await wasmModule.default(); 
    const wasm = wasmModule;
    wasm.setup();
    return wasm;
  },

  async generateIdentity(): Promise<UmbraIdentity> {
    const wasm = await wasmPromise;
    return wasm.UmbraIdentity.generate();
  },

  async restoreIdentity(spendSkHex: string, viewSkHex: string): Promise<UmbraIdentity> {
    const wasm = await wasmPromise;
    return wasm.UmbraIdentity.from_secret_keys(spendSkHex, viewSkHex);
  },

  async encryptMemo(
    recipientViewPubkeyHex: string, 
    recipientSpendPubkeyHex: string, 
    memo: string
  ): Promise<any> {
    const wasm = await wasmPromise;
    const jsonStr = wasm.encrypt_memo_wasm(
      recipientViewPubkeyHex, 
      recipientSpendPubkeyHex, 
      memo
    );
    return JSON.parse(jsonStr);
  },

  async decryptMemo(
    viewSkHex: string,
    ephemeralPubkeyHex: string,
    encryptedMemo: string
  ): Promise<string> {
    const wasm = await wasmPromise;
    return wasm.decrypt_memo_wasm(viewSkHex, ephemeralPubkeyHex, encryptedMemo);
  },

  async recoverStealthSecret(
      viewSkHex: string,
      spendSkHex: string,
      ephemeralPubkeyHex: string
  ): Promise<{ secret: string; pubkey: string }> {
      const wasm = await wasmPromise;
      const json = wasm.recover_stealth_secret_wasm(viewSkHex, spendSkHex, ephemeralPubkeyHex);
      return JSON.parse(json);
  },

  async signRelayerRequest(
      stealthSecretHex: string,
      messageHex: string
  ): Promise<string> {
      const wasm = await wasmPromise;
      return wasm.sign_message_wasm(stealthSecretHex, messageHex);
  },
  
  // Client-side scanning logic
  async scanBatch(
    viewSkHex: string,
    announcements: import('../types/umbra').StealthSignal[]
  ): Promise<import('../types/umbra').StealthSignal[]> {
    const wasm = await wasmPromise;
    const results: import('../types/umbra').StealthSignal[] = [];
    
    console.log(`[ScanBatch] Scanning ${announcements.length} announcements with viewSk: ${viewSkHex.substring(0, 16)}...`);
    
    for (const ann of announcements) {
      try {
        const plaintext = wasm.decrypt_memo_wasm(viewSkHex, ann.ephemeral_pubkey, ann.cipher_text);
        if (plaintext) {
          console.log(`[ScanBatch] ✅ Decrypted: "${plaintext}" (Status: ${ann.status})`);
          results.push({ 
              ...ann, 
              plaintext,
              is_claimable: ann.status === 'Pending' // Only Pending signals are claimable
          });
        }
      } catch (e: any) {
        // Not ours or failed decryption
      }
    }
    console.log(`[ScanBatch] Found ${results.length} matching signals`);
    return results;
  }
  ,
  createSendStealthSplInstruction(
    payer: PublicKey,
    mint: PublicKey,
    senderToken: PublicKey,
    stealthPda: PublicKey,
    stealthToken: PublicKey,
    stealthPubkey: PublicKey,
    amount: bigint,
    announcement: { ephemeralPubkey: string, hashedTag: string, ciphertext: string }
  ): TransactionInstruction {
    const cipherBytes = hexToBytes(announcement.ciphertext);
    const size = 1 + 8 + 32 + 32 + 4 + cipherBytes.length;
    const buffer = new Uint8Array(size);
    const view = new DataView(buffer.buffer);
    let offset = 0;
    
    view.setUint8(offset, 1); offset += 1; // Discriminator 1
    view.setBigUint64(offset, amount, true); offset += 8;
    
    buffer.set(hexToBytes(announcement.ephemeralPubkey), offset); offset += 32;
    buffer.set(hexToBytes(announcement.hashedTag), offset); offset += 32;
    
    view.setUint32(offset, cipherBytes.length, true); offset += 4;
    buffer.set(cipherBytes, offset);

    const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: mint, isSigner: false, isWritable: false },
        { pubkey: senderToken, isSigner: false, isWritable: true },
        { pubkey: stealthPda, isSigner: false, isWritable: true },
        { pubkey: stealthToken, isSigner: false, isWritable: true },
        { pubkey: stealthPubkey, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
        keys,
        programId: UMBRA_PROGRAM_ID,
        data: Buffer.from(buffer),
    });
  },

  createSendStealthInstruction(
    payer: PublicKey,
    stealthPda: PublicKey,
    stealthPubkey: PublicKey,
    amount: bigint,
    announcement: { ephemeralPubkey: string, hashedTag: string, ciphertext: string }
  ): TransactionInstruction {
    const cipherBytes = hexToBytes(announcement.ciphertext);
    const size = 1 + 8 + 32 + 32 + 4 + cipherBytes.length;
    const buffer = new Uint8Array(size);
    const view = new DataView(buffer.buffer);
    let offset = 0;
    
    view.setUint8(offset, 0); offset += 1; // Discriminator 0 (SendStealth SOL)
    view.setBigUint64(offset, amount, true); offset += 8;
    
    buffer.set(hexToBytes(announcement.ephemeralPubkey), offset); offset += 32;
    buffer.set(hexToBytes(announcement.hashedTag), offset); offset += 32;
    
    view.setUint32(offset, cipherBytes.length, true); offset += 4;
    buffer.set(cipherBytes, offset);

    const keys = [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: stealthPda, isSigner: false, isWritable: true },
        { pubkey: stealthPubkey, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
        keys,
        programId: UMBRA_PROGRAM_ID,
        data: Buffer.from(buffer),
    });
  },

  createWithdrawInstruction(
      stealthPda: PublicKey,
      authority: PublicKey,
      recipient: PublicKey
  ): TransactionInstruction {
      const buffer = new Uint8Array(1);
      buffer[0] = 2; // Discriminator 2 (Withdraw)
      
      const keys = [
          { pubkey: stealthPda, isSigner: false, isWritable: true },
          { pubkey: authority, isSigner: true, isWritable: false },
          { pubkey: recipient, isSigner: false, isWritable: true },
      ];
      
      return new TransactionInstruction({
          keys,
          programId: UMBRA_PROGRAM_ID,
          data: Buffer.from(buffer),
      });
  }
};
