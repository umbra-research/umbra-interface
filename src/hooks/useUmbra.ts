import { useEffect, useState } from 'react';

// Define the shape of our WASM module interface
interface UmbraWasm {
  setup: () => void;
  UmbraIdentity: {
    generate: () => any;
    from_secret_keys: (spend: string, view: string) => any;
  };
  encrypt_memo_wasm: (
    view_secret: string,
    recipient_view_pub: string,
    recipient_spend_pub: string,
    memo: string
  ) => string;
  decrypt_memo_wasm: (
    view_secret: string,
    eph_pub: string,
    encrypted: string
  ) => string;
}

export const useUmbra = () => {
  const [wasm, setWasm] = useState<UmbraWasm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        // Dynamically import the WASM module
        // @ts-ignore - The package is linked locally, TS might not see types yet
        const m = await import('../../../umbra-rs/crates/umbra-wasm/pkg/umbra_wasm');
        
        // Initialize if required (some wasm-pack modes require init())
        if (m.default && typeof m.default === 'function') {
             await m.default();
        }
        
        // Run setup
        if (m.setup) {
            m.setup();
        }

        setWasm(m);
        setIsReady(true);
      } catch (err: any) {
        console.error("Failed to load Umbra WASM:", err);
        setError(err.message || 'Failed to load crypto engine');
      }
    };

    loadWasm();
  }, []);

  const generateIdentity = async () => {
    if (!wasm) throw new Error("WASM not loaded");
    const id = wasm.UmbraIdentity.generate();
    // Return the JSON representation
    return JSON.parse(id.to_json());
  };

  const encryptMemo_wasm = async (
      viewSecret: string,
      recipientViewPub: string, 
      recipientSpendPub: string, 
      memo: string
  ): Promise<string> => {
       if (!wasm) throw new Error("WASM not loaded");
       // Note: implementation in lib.rs might need adjusting to match these args
       // For now, we assume WASM signature: (view_secret, recipient_view, recipient_spend, memo)
       return wasm.encrypt_memo_wasm(viewSecret, recipientViewPub, recipientSpendPub, memo);
  };

  return {
    isReady,
    error,
    generateIdentity,
    encryptMemo_wasm,
    raw: wasm
  };
};
