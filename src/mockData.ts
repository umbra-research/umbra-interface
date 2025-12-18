// ============ SOLANA-SHAPED TYPES ============

export type Cluster = 'mainnet-beta' | 'devnet' | 'localnet' | 'custom';

export type Token = {
  symbol: string;
  name: string;
  mint?: string;           // SPL token mint (optional for SOL)
  decimals: number;
  balance: number;
  icon?: string;
  cluster: Cluster;
};

export type TxStatus = 'submitted' | 'confirmed' | 'finalized' | 'failed';

export type ActivityItem = {
  id: string;
  type: 'Sent' | 'Received' | 'Claimed' | 'Claim_Initiated';
  token: string;
  amount: number;
  status: TxStatus;
  timestamp: string;
  cluster: Cluster;
  counterparty: string;     // Full base58 address
  counterpartyMasked: string;
  signature?: string;       // Solana tx signature
  claimSignature?: string;
  feeSOL?: number;
};

export type Address = {
  id: string;
  label: string;
  publicKey: string;        // Full base58 public key
  publicKeyMasked: string;  // e.g., "9xQe…Hk3M"
  created: string;
  isDefault?: boolean;
  archived?: boolean;
};

export type InboxItem = {
  id: string;
  token: string;
  amount: number;
  senderMasked: string;
  timestamp: string;
  status: 'claimable' | 'claiming' | 'claimed' | 'failed';
  cluster: Cluster;
};

export type WalletState = {
  connected: boolean;
  publicKey: string;        // Full base58
  publicKeyMasked: string;  // e.g., "9xQe…Hk3M"
  cluster: Cluster;
  loading: boolean;
};

// ============ MOCK DATA (SOLANA) ============

export const mockClusters = [
  { name: 'mainnet-beta' as Cluster, label: 'Mainnet Beta', rpc: 'https://api.mainnet-beta.solana.com' },
  { name: 'devnet' as Cluster, label: 'Devnet', rpc: 'https://api.devnet.solana.com' },
  { name: 'localnet' as Cluster, label: 'Localnet', rpc: 'http://localhost:8899' }
];

export const mockTokens: Token[] = [
  { symbol: 'SOL', name: 'Solana', decimals: 9, balance: 2.5, cluster: 'mainnet-beta', icon: '◎' },
  { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWaLb3K3jgUqe5z8dNjMoKPz4uLTsLPFqYjvVnK1Y', decimals: 6, balance: 500.25, cluster: 'mainnet-beta' },
  { symbol: 'USDT', name: 'Tether', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, balance: 1050.5, cluster: 'mainnet-beta' },
  { symbol: 'SOL', name: 'Solana', decimals: 9, balance: 10.0, cluster: 'devnet', icon: '◎' },
  { symbol: 'USDC', name: 'USD Coin (test)', decimals: 6, balance: 100, cluster: 'devnet' }
];

export const mockAddresses: Address[] = [
  {
    id: 'addr-1',
    label: 'Primary',
    publicKey: '9xQeURPjwLGvgxk3JtFkRZvd7YCqMMPZvGzFbxECXJqM',
    publicKeyMasked: '9xQe…CXJqM',
    created: '2024-01-10',
    isDefault: true
  },
  {
    id: 'addr-2',
    label: 'Savings',
    publicKey: 'GrqPdEQJLMZvPbkZxfk1v8gvfGwJLgUoYcvPjJLBJ3SQ',
    publicKeyMasked: 'GrqP…BJ3SQ',
    created: '2024-02-02'
  },
  {
    id: 'addr-3',
    label: 'Shared',
    publicKey: 'HZhWfgW3HZhWfgW3KtFkRZvd7YCqMMPZvGzFbxECXJqA',
    publicKeyMasked: 'HZhW…ECXJqA',
    created: '2024-02-18'
  }
];

export const mockActivity: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'Sent',
    token: 'USDC',
    amount: 250.12,
    status: 'finalized',
    timestamp: '2024-03-12 12:14 UTC',
    cluster: 'mainnet-beta',
    counterparty: 'HZhWfgW3KtFkRZvd7YCqMMPZvGzFbxECXJqMz8EaBvjA',
    counterpartyMasked: 'HZhW…BvjA',
    signature: '4iKv9ExeakqRoUh2P2bySYDX8n8A7mB3qCqSfwBhKjFxYLzC1zJ2CdF3B4gEn5vUu6wXyZaBcD7eF',
    feeSOL: 0.00025
  },
  {
    id: 'act-2',
    type: 'Received',
    token: 'USDC',
    amount: 100.5,
    status: 'confirmed',
    timestamp: '2024-03-11 19:45 UTC',
    cluster: 'mainnet-beta',
    counterparty: 'J2CdF3B4gEn5vUu6wXyZaBcD7eF8gHiJ9kKlMnOpQrSt',
    counterpartyMasked: 'J2Cd…QrSt',
    signature: 'HtK6FvJxCgNpD8EqRsUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOp'
  },
  {
    id: 'act-3',
    type: 'Claimed',
    token: 'SOL',
    amount: 0.5,
    status: 'finalized',
    timestamp: '2024-03-10 09:30 UTC',
    cluster: 'mainnet-beta',
    counterparty: 'K3DeG4ChFm6wTxYzAbCdEfGhIjKlMnOpQrStUvWxYzAb',
    counterpartyMasked: 'K3De…xYzAb',
    signature: 'PqRsUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYz',
    claimSignature: 'aBcDeF1gHiJkLmNoPqRsUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhI',
    feeSOL: 0.00025
  }
];

export const mockInboxItems: InboxItem[] = [
  {
    id: 'inbox-1',
    token: 'USDC',
    amount: 100.5,
    senderMasked: 'J2Cd…QrSt',
    timestamp: '2024-03-13 14:22 UTC',
    status: 'claimable',
    cluster: 'mainnet-beta'
  },
  {
    id: 'inbox-2',
    token: 'SOL',
    amount: 1.5,
    senderMasked: 'K3De…xYzAb',
    timestamp: '2024-03-12 19:45 UTC',
    status: 'claimable',
    cluster: 'mainnet-beta'
  },
  {
    id: 'inbox-3',
    token: 'USDC',
    amount: 50,
    senderMasked: 'L4Ef…yZaBc',
    timestamp: '2024-03-11 10:15 UTC',
    status: 'claimed',
    cluster: 'mainnet-beta'
  },
  {
    id: 'inbox-4',
    token: 'USDT',
    amount: 500,
    senderMasked: 'M5Fg…ZaBcD',
    timestamp: '2024-03-10 16:30 UTC',
    status: 'claiming',
    cluster: 'mainnet-beta'
  }
];

export const mockWalletState: WalletState = {
  connected: true,
  publicKey: '9xQeURPjwLGvgxk3JtFkRZvd7YCqMMPZvGzFbxECXJqM',
  publicKeyMasked: '9xQe…CXJqM',
  cluster: 'mainnet-beta',
  loading: false
};

// ============ UTILITIES ============

export function maskAddress(address: string, chars: number = 4): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function getTokenBySymbol(symbol: string, cluster: Cluster): Token | undefined {
  return mockTokens.find(t => t.symbol === symbol && t.cluster === cluster);
}

export function getDefaultAddress(): Address | undefined {
  return mockAddresses.find(a => a.isDefault);
}

export function getClusterLabel(cluster: Cluster): string {
  return mockClusters.find(c => c.name === cluster)?.label || cluster;
}
