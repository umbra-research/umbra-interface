import { useState, useEffect, useCallback } from 'react';
import { UmbraService } from '../services/umbra';
import { BackendService } from '../services/backend';
import { validateSignal, StealthSignal } from '../types/umbra';

// Storage keys
const STORAGE_KEY_LAST_SYNC = 'umbra_last_sync_timestamp';
const STORAGE_KEY_OWNED = 'umbra_owned_announcements'; // In memory mainly or IndexDB, simple localstorage for demo

export const useSyncEngine = (viewSecretKey: string | null, userId: string | null) => {
    const [isScanning, setIsScanning] = useState(false);
    const [ownedItems, setOwnedItems] = useState<StealthSignal[]>([]);
    
    // Dynamic storage key based on user
    const getStorageKey = useCallback(() => {
        if (!userId) return null;
        return `umbra_owned_${userId}`;
    }, [userId]);

    // Load initial state & Reset on change
    useEffect(() => {
        const key = getStorageKey();
        if (key) {
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    setOwnedItems(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse stored signals", e);
                    setOwnedItems([]);
                }
            } else {
                setOwnedItems([]); // No stored data for this user
            }
        } else {
            setOwnedItems([]); // No user
        }
    }, [userId, getStorageKey]);

    const scan = useCallback(async () => {
        if (!viewSecretKey) return;
        setIsScanning(true);

        try {
            // 1.Fetch from Backend
            let rawAnnouncements;
            try {
                rawAnnouncements = await BackendService.getInbox();
            } catch (err) {
                console.error("Backend fetch failed", err);
                setIsScanning(false);
                return;
            }
            
            if (!rawAnnouncements || rawAnnouncements.length === 0) {
                console.log("[Sync] No announcements fetched");
                setIsScanning(false);
                return;
            }
            console.log("[Sync] Raw fetched:", rawAnnouncements.length);

            // Validate strict types
            const validSignals = rawAnnouncements.map((a: any) => {
                try {
                    return validateSignal(a);
                } catch (e) {
                    console.warn("Skipping invalid signal:", e);
                    return null;
                }
            }).filter((s: any) => s !== null) as StealthSignal[];

            console.log(`[Sync] Scanning ${validSignals.length} items...`);

            // 2. Scan with WASM
            const found = await UmbraService.scanBatch(viewSecretKey, validSignals);
            
            if (found.length > 0) {
                console.log(`[Sync] Found ${found.length} new signals!`);
                
                // Update state
                setOwnedItems(prev => {
                    // Update existing items if we re-scanned them (e.g. status change)
                    // Merge based on ID
                    const map = new Map(prev.map(i => [i.id, i]));
                    found.forEach(f => map.set(f.id, f));
                    
                    const unique = Array.from(map.values());
                    // Sort by timestamp desc?
                    unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    
                    const key = getStorageKey();
                    if (key) localStorage.setItem(key, JSON.stringify(unique));
                    return unique;
                });
            }

            // Update timestamp (use latest from FETCHED list, not found list)
            const latest = validSignals[validSignals.length - 1]?.timestamp;
            if (latest) localStorage.setItem(STORAGE_KEY_LAST_SYNC, latest);
            
        } catch (e) {
            console.error("Sync failed:", e);
        } finally {
            setIsScanning(false);
        }
    }, [viewSecretKey]);

    // Poll every 10s
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (viewSecretKey) {
            scan(); // Initial
            interval = setInterval(scan, 10000);
        }
        return () => clearInterval(interval);
    }, [viewSecretKey, scan]);

    return {
        isScanning,
        ownedItems,
        scan
    };
};
