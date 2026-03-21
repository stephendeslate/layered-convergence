'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface UseSSEOptions {
  url: string;
  enabled?: boolean;
}

interface SSEState<T> {
  data: T | null;
  error: string | null;
  isConnected: boolean;
}

export function useSSE<T>({ url, enabled = true }: UseSSEOptions): SSEState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;

    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data) as T;
        setData(parsed);
      } catch {
        setError('Failed to parse SSE data');
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError('SSE connection lost');
      eventSource.close();
    };
  }, [url, enabled]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  return { data, error, isConnected };
}
