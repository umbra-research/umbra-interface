import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  Keypair,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getMint,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

// RPC endpoints
export const RPC_ENDPOINTS = {
  "mainnet-beta": "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  localnet: "http://localhost:8899",
  custom: "",
} as const;

export type Cluster = "mainnet-beta" | "devnet" | "localnet" | "custom";

// Initialize connection
export const getConnection = (cluster: Cluster): Connection => {
  const endpoint = RPC_ENDPOINTS[cluster];
  return new Connection(endpoint, "confirmed");
};

/**
 * Fetch SOL balance for a public key
 */
export const getSolBalance = async (
  cluster: Cluster,
  publicKey: PublicKey
): Promise<number> => {
  try {
    const connection = getConnection(cluster);
    const lamports = await connection.getBalance(publicKey);
    return lamports / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error fetching SOL balance:", error);
    throw new Error("Failed to fetch SOL balance");
  }
};

/**
 * Get SPL token balance
 */
export const getTokenBalance = async (
  cluster: Cluster,
  walletPublicKey: PublicKey,
  tokenMint: PublicKey
): Promise<number> => {
  try {
    const connection = getConnection(cluster);
    const tokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      walletPublicKey
    );
    const accountInfo = await connection.getTokenAccountBalance(tokenAccount);
    return (
      parseFloat(accountInfo.value.amount) /
      Math.pow(10, accountInfo.value.decimals)
    );
  } catch (error) {
    // Token account doesn't exist yet (normal for new tokens)
    return 0;
  }
};

/**
 * Get token decimals
 */
export const getTokenDecimals = async (
  cluster: Cluster,
  tokenMint: PublicKey
): Promise<number> => {
  try {
    const connection = getConnection(cluster);
    const mint = await getMint(connection, tokenMint);
    return mint.decimals;
  } catch (error) {
    console.error("Error fetching token decimals:", error);
    return 6; // Default to 6 decimals (USDC standard)
  }
};

/**
 * Validate Solana address (base58 public key)
 */
export const validateAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * Estimate transaction fee
 */
export const estimateTransactionFee = async (
  cluster: Cluster
): Promise<number> => {
  try {
    const connection = getConnection(cluster);
    const feeData = await connection.getRecentBlockhash("finalized");
    // Fee is in lamports, convert to SOL
    return 5000 / LAMPORTS_PER_SOL; // ~0.00005 SOL per transaction
  } catch (error) {
    console.error("Error estimating fee:", error);
    return 0.00005; // Fallback fee
  }
};

/**
 * Get transaction status
 */
export const getTransactionStatus = async (
  cluster: Cluster,
  signature: string
): Promise<"submitted" | "confirmed" | "finalized" | "failed" | "unknown"> => {
  try {
    const connection = getConnection(cluster);
    const status = await connection.getSignatureStatus(signature);

    if (!status || !status.value) {
      return "unknown";
    }

    if (status.value.err) {
      return "failed";
    }

    if (status.value.confirmations === null) {
      return "finalized";
    }

    if (status.value.confirmations > 30) {
      return "finalized";
    }

    if (status.value.confirmations > 1) {
      return "confirmed";
    }

    return "submitted";
  } catch (error) {
    console.error("Error fetching transaction status:", error);
    return "unknown";
  }
};

/**
 * Get recent transactions for a wallet
 */
export const getWalletTransactions = async (
  cluster: Cluster,
  publicKey: PublicKey,
  limit: number = 10
): Promise<any[]> => {
  try {
    const connection = getConnection(cluster);
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit,
    });

    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        const tx = await connection.getParsedTransaction(
          sig.signature,
          "confirmed"
        );
        return {
          signature: sig.signature,
          status: sig.err ? "failed" : "confirmed",
          timestamp: sig.blockTime ? new Date(sig.blockTime * 1000) : null,
          fee: tx?.meta?.fee || 0,
        };
      })
    );

    return transactions;
  } catch (error) {
    console.error("Error fetching wallet transactions:", error);
    return [];
  }
};

/**
 * Format address for display (9xQe...JqM style)
 */
export const formatAddress = (address: string, chars = 4): string => {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
};

/**
 * Convert lamports to SOL
 */
export const lamportsToSol = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

/**
 * Convert SOL to lamports
 */
export const solToLamports = (sol: number): number => {
  return Math.round(sol * LAMPORTS_PER_SOL);
};

/**
 * Airdrop SOL (devnet only for testing)
 */
export const requestAirdrop = async (
  cluster: Cluster,
  publicKey: PublicKey,
  amount: number = 2
): Promise<string> => {
  if (cluster !== "devnet" && cluster !== "localnet") {
    throw new Error("Airdrops only available on devnet/localnet");
  }

  try {
    const connection = getConnection(cluster);
    const signature = await connection.requestAirdrop(
      publicKey,
      solToLamports(amount)
    );
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error("Error requesting airdrop:", error);
    throw new Error("Failed to request airdrop");
  }
};

/**
 * Monitor transaction status with polling
 */
export const monitorTransaction = async (
  cluster: Cluster,
  signature: string,
  onStatusChange: (
    status: "submitted" | "confirmed" | "finalized" | "failed"
  ) => void,
  maxWaitMs: number = 60000
): Promise<void> => {
  const startTime = Date.now();
  const pollInterval = 1000; // Poll every 1 second

  return new Promise((resolve, reject) => {
    const poll = async () => {
      const status = await getTransactionStatus(cluster, signature);

      if (status !== "unknown") {
        onStatusChange(status);
      }

      if (status === "finalized" || status === "failed") {
        resolve();
        return;
      }

      if (Date.now() - startTime > maxWaitMs) {
        reject(new Error("Transaction monitoring timeout"));
        return;
      }

      setTimeout(poll, pollInterval);
    };

    poll();
  });
};
