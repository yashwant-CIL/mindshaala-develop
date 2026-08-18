import { useState, useEffect } from 'react';

interface NetworkTimeState {
  netBase: number;
  perfBase: number;
  isSynced: boolean;
}

let timeState: NetworkTimeState = {
  netBase: Date.now(),
  perfBase: performance.now(),
  isSynced: false
};

let syncPromise: Promise<number> | null = null;

/**
 * Fetches accurate internet/server UTC timestamp using CORS-safe, free sources.
 * 1. Server HTTP HEAD Date header (Same-Origin, 100% free & zero CORS issue)
 * 2. WorldTimeAPI (Free public UTC time API)
 * 3. Fallback to local system time
 */
export async function fetchInternetTimestamp(): Promise<number> {
  // 1. Try Same-Origin HTTP HEAD request (Fastest, 100% free, 0 CORS issues)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(window.location.origin + '/?_t=' + Date.now(), {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);
    const dateHeader = res.headers.get('date') || res.headers.get('Date');
    if (dateHeader) {
      const serverTime = new Date(dateHeader).getTime();
      if (!isNaN(serverTime) && serverTime > 0) {
        return serverTime;
      }
    }
  } catch (e) {
    // ignore & try next provider
  }

  // 2. Try WorldTimeAPI (Free UTC time service)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.unixtime) {
        return data.unixtime * 1000;
      }
      if (data.datetime) {
        return new Date(data.datetime).getTime();
      }
    }
  } catch (e) {
    // ignore
  }

  // Fallback to local system time if network fetch fails or offline
  return Date.now();
}

/**
 * Initializes and synchronizes internet network time.
 */
export function syncNetworkTime(): Promise<number> {
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      const internetMs = await fetchInternetTimestamp();
      timeState = {
        netBase: internetMs,
        perfBase: performance.now(),
        isSynced: true
      };
      return internetMs;
    } finally {
      syncPromise = null;
    }
  })();

  return syncPromise;
}

/**
 * Returns current network timestamp in ms.
 * Unaffected by local OS system time/clock changes!
 */
export function getNetworkNow(): number {
  if (!timeState.isSynced && !syncPromise) {
    // Trigger async sync in background if not synced yet
    syncNetworkTime();
  }
  return timeState.netBase + (performance.now() - timeState.perfBase);
}

/**
 * React hook returning live current network timestamp updated every `intervalMs`.
 */
export function useNetworkNow(intervalMs: number = 1000): number {
  const [nowMs, setNowMs] = useState<number>(() => getNetworkNow());

  useEffect(() => {
    // Initial sync
    syncNetworkTime().then(() => {
      setNowMs(getNetworkNow());
    });

    const timer = setInterval(() => {
      setNowMs(getNetworkNow());
    }, intervalMs);

    // Re-sync on window focus
    const handleFocus = () => {
      syncNetworkTime().then(() => setNowMs(getNetworkNow()));
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleFocus);
    };
  }, [intervalMs]);

  return nowMs;
}

// Initial sync call on module load
syncNetworkTime();
