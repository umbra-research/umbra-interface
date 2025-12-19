export interface SystemStatus {
  system: string;
  connected: boolean;
  version: string;
}

const API_BASE_URL = 'http://localhost:8080';

export async function fetchSystemStatus(): Promise<SystemStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status`);
    if (!response.ok) {
      throw new Error(`Error fetching status: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to connect to Umbra System:", error);
    return {
      system: 'disconnected',
      connected: false,
      version: 'unknown'
    };
  }
}

export interface SendRequest {
  payer: string;
  recipient: string;
  amount: string;
  token: string;
}

export interface SendResponse {
  transaction: string;
  status: string;
}

export async function sendTransfer(data: SendRequest): Promise<SendResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
        throw new Error(`Send failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to create transfer:", error);
    return {
        transaction: '',
        status: 'failed'
    };
  }
}

export interface InboxItem {
    id: string;
    timestamp: string;
    payer: string;
    recipient: string;
    amount: number;
    token: string;
    status: string;
    signature: string;
}

export async function fetchInbox(recipient: string): Promise<InboxItem[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/inbox?recipient=${recipient}`);
        if (!res.ok) {
            throw new Error('Failed to fetch inbox');
        }
        return await res.json();
    } catch (error) {
        console.error('Fetch Inbox Error:', error);
        return [];
    }
}

export interface ClaimResponse {
    status: string;
    signatures?: string[];
    error?: string;
}

export async function claimFunds(recipient: string): Promise<ClaimResponse> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipient }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Claim failed (${res.status}): ${text}`);
        }
        return await res.json();
    } catch (error) {
        console.error('Claim Error:', error);
        return { status: 'failed', error: String(error) };
    }
}
