'use client';

import { useState, useEffect, useCallback } from 'react';

interface SseMessage {
  pipelineId: string;
  tenantId: string;
  timestamp: string;
  status: string;
}

export function useSse(pipelineId: string) {
  const [messages, setMessages] = useState<SseMessage[]>([]);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const eventSource = new EventSource(`${apiUrl}/pipelines/${pipelineId}/monitor`);

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as SseMessage;
      setMessages((prev) => [...prev.slice(-49), data]);
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
    };

    return eventSource;
  }, [pipelineId]);

  useEffect(() => {
    const eventSource = connect();
    return () => eventSource.close();
  }, [connect]);

  return { messages, connected };
}
