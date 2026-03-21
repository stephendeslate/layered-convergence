"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import type { GpsUpdate } from "@/lib/types";

const WS_BASE_URL = process.env.WS_BASE_URL ?? "ws://localhost:3001";

interface GpsStore {
  updates: Map<string, GpsUpdate>;
  listeners: Set<() => void>;
  ws: WebSocket | null;
  connected: boolean;
}

function createGpsStore(token: string): GpsStore {
  const store: GpsStore = {
    updates: new Map(),
    listeners: new Set(),
    ws: null,
    connected: false,
  };

  function connect() {
    const ws = new WebSocket(`${WS_BASE_URL}/gps?token=${token}`);

    ws.addEventListener("open", () => {
      store.connected = true;
      emitChange();
    });

    ws.addEventListener("message", (event: MessageEvent) => {
      const data = JSON.parse(event.data as string) as GpsUpdate;
      store.updates = new Map(store.updates);
      store.updates.set(data.technicianId, data);
      emitChange();
    });

    ws.addEventListener("close", () => {
      store.connected = false;
      store.ws = null;
      emitChange();
    });

    ws.addEventListener("error", () => {
      ws.close();
    });

    store.ws = ws;
  }

  function emitChange() {
    for (const listener of store.listeners) {
      listener();
    }
  }

  connect();

  return store;
}

export function useGpsUpdates(token: string) {
  const storeRef = useRef<GpsStore | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createGpsStore(token);
  }

  const store = storeRef.current;

  const subscribe = useCallback(
    (callback: () => void) => {
      store.listeners.add(callback);
      return () => {
        store.listeners.delete(callback);
      };
    },
    [store]
  );

  const getSnapshot = useCallback(() => {
    return store.updates;
  }, [store]);

  const getServerSnapshot = useCallback(() => {
    return new Map<string, GpsUpdate>();
  }, []);

  const updates = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const [connected] = useState(() => store.connected);

  const sendLocation = useCallback(
    (latitude: number, longitude: number) => {
      if (store.ws && store.ws.readyState === WebSocket.OPEN) {
        store.ws.send(JSON.stringify({ latitude, longitude }));
      }
    },
    [store]
  );

  const disconnect = useCallback(() => {
    if (store.ws) {
      store.ws.close();
      store.ws = null;
    }
  }, [store]);

  return {
    updates,
    connected,
    sendLocation,
    disconnect,
  };
}
