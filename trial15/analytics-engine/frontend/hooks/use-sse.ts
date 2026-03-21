"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseSSEOptions {
  url: string;
  token?: string;
  tenantId?: string;
  enabled?: boolean;
}

interface UseSSEResult<T> {
  data: T | null;
  error: string | null;
  isConnected: boolean;
  reconnect: () => void;
}

export function useSSE<T>({
  url,
  token,
  tenantId,
  enabled = true,
}: UseSSEOptions): UseSSEResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectKeyRef = useRef(0);

  const connect = useCallback(() => {
    if (!enabled) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const separator = url.includes("?") ? "&" : "?";
    const params = new URLSearchParams();
    if (token) params.set("token", token);
    if (tenantId) params.set("tenantId", tenantId);
    const paramString = params.toString();
    const fullUrl = paramString ? `${url}${separator}${paramString}` : url;

    const eventSource = new EventSource(fullUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data as string) as T;
        setData(parsed);
      } catch {
        setError("Failed to parse SSE data");
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setError("SSE connection lost");
      eventSource.close();
    };
  }, [url, token, tenantId, enabled]);

  const reconnect = useCallback(() => {
    reconnectKeyRef.current += 1;
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [connect]);

  return { data, error, isConnected, reconnect };
}
