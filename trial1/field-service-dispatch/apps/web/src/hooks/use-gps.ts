'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getGpsSocket, getDispatchSocket } from '@/lib/socket';
import { WS_EVENTS } from '@fsd/shared';
import type { GpsUpdate } from '@fsd/shared';

export function useGpsTracking(onUpdate: (update: GpsUpdate) => void) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const socket = getDispatchSocket(token || undefined);

    socket.connect();

    socket.on(WS_EVENTS.GPS_POSITION, (data: GpsUpdate) => {
      callbackRef.current(data);
    });

    return () => {
      socket.off(WS_EVENTS.GPS_POSITION);
    };
  }, []);
}

export function useGpsBroadcast(technicianId: string | null) {
  const watchIdRef = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!technicianId || typeof navigator === 'undefined' || !navigator.geolocation) return;

    const token = localStorage.getItem('accessToken');
    const socket = getGpsSocket(token || undefined);
    socket.connect();

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        socket.emit(WS_EVENTS.GPS_UPDATE, {
          technicianId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: new Date().toISOString(),
        });
      },
      (err) => {
        console.error('GPS error:', err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );
  }, [technicianId]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return stopTracking;
  }, [stopTracking]);

  return { startTracking, stopTracking };
}
