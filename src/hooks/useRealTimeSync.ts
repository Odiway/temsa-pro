import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface SyncData {
  projects?: any[];
  tasks?: any[];
  users?: any[];
  departments?: any[];
  stats?: any;
  lastUpdated: string;
}

interface UseRealTimeSyncOptions {
  endpoint: string;
  pollingInterval?: number;
  onUpdate?: (data: SyncData) => void;
  enabled?: boolean;
}

export function useRealTimeSync({
  endpoint,
  pollingInterval = 5000, // 5 seconds default
  onUpdate,
  enabled = true
}: UseRealTimeSyncOptions) {
  const { data: session, status } = useSession();
  const [data, setData] = useState<SyncData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<string>('');

  const fetchData = useCallback(async () => {
    if (!session?.user?.id || status !== 'authenticated') return;

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Cache-Control': 'no-cache',
          'If-Modified-Since': lastFetchRef.current
        }
      });

      if (response.ok) {
        const newData = await response.json();
        
        // Check if data actually changed
        const dataString = JSON.stringify(newData);
        if (dataString !== lastFetchRef.current) {
          lastFetchRef.current = dataString;
          setData(newData);
          onUpdate?.(newData);
        }
        setError(null);
      } else if (response.status !== 304) { // 304 = Not Modified
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('Real-time sync error:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setLoading(false);
    }
  }, [endpoint, session?.user?.id, status, onUpdate]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Initial fetch
    fetchData();
    
    // Set up polling
    intervalRef.current = setInterval(fetchData, pollingInterval);
  }, [fetchData, pollingInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const forceRefresh = useCallback(() => {
    lastFetchRef.current = '';
    fetchData();
  }, [fetchData]);

  // Effect for starting/stopping polling based on enabled state
  useEffect(() => {
    if (enabled && status === 'authenticated') {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [enabled, status, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // Handle visibility change to pause/resume when tab is not active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (enabled && status === 'authenticated') {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, status, startPolling, stopPolling]);

  return {
    data,
    loading,
    error,
    forceRefresh,
    isConnected: !error && status === 'authenticated'
  };
}

// Specialized hooks for different data types
export function useProjectSync(onUpdate?: (projects: any[]) => void) {
  return useRealTimeSync({
    endpoint: '/api/dashboard/real-time',
    onUpdate: (data) => {
      if (data.projects && onUpdate) {
        onUpdate(data.projects);
      }
    }
  });
}

export function useTaskSync(onUpdate?: (tasks: any[]) => void) {
  return useRealTimeSync({
    endpoint: '/api/dashboard/real-time',
    onUpdate: (data) => {
      if (data.tasks && onUpdate) {
        onUpdate(data.tasks);
      }
    }
  });
}

export function useDepartmentSync(onUpdate?: (departments: any[]) => void) {
  return useRealTimeSync({
    endpoint: '/api/dashboard/real-time',
    onUpdate: (data) => {
      if (data.departments && onUpdate) {
        onUpdate(data.departments);
      }
    }
  });
}

export function useStatsSync(onUpdate?: (stats: any) => void) {
  return useRealTimeSync({
    endpoint: '/api/dashboard/real-time',
    onUpdate: (data) => {
      if (data.stats && onUpdate) {
        onUpdate(data.stats);
      }
    }
  });
}
