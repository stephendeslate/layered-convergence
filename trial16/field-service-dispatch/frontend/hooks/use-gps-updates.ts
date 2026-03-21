'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { GpsUpdate } from '@/lib/types';

interface UseGpsUpdatesOptions {
  technicianId?: string;
  url?: string;
}

export function useGpsUpdates({ technicianId, url }: UseGpsUpdatesOptions = {}) {
  const [lastUpdate, setLastUpdate] = useState<GpsUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const wsUrl = url ?? 'ws://localhost:3000/gps';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      if (technicianId) {
        ws.send(JSON.stringify({
          event: 'location:subscribe',
          data: { technicianId },
        }));
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(String(event.data)) as { event: string; data: GpsUpdate };
        if (data.event === 'location:updated') {
          setLastUpdate(data.data);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };
  }, [technicianId, url]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { lastUpdate, isConnected, connect, disconnect };
}
