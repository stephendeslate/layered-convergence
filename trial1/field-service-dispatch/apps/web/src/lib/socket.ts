import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let gpsSocket: Socket | null = null;
let dispatchSocket: Socket | null = null;
let trackingSocket: Socket | null = null;

function createSocket(namespace: string, auth?: Record<string, string>): Socket {
  return io(`${SOCKET_URL}${namespace}`, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    auth,
  });
}

export function getGpsSocket(token?: string): Socket {
  if (!gpsSocket) {
    gpsSocket = createSocket('/gps', token ? { token } : undefined);
  }
  return gpsSocket;
}

export function getDispatchSocket(token?: string): Socket {
  if (!dispatchSocket) {
    dispatchSocket = createSocket('/dispatch', token ? { token } : undefined);
  }
  return dispatchSocket;
}

export function getTrackingSocket(trackingToken?: string): Socket {
  if (!trackingSocket) {
    trackingSocket = createSocket('/tracking', trackingToken ? { token: trackingToken } : undefined);
  }
  return trackingSocket;
}

export function disconnectAll(): void {
  [gpsSocket, dispatchSocket, trackingSocket].forEach((s) => {
    if (s?.connected) s.disconnect();
  });
  gpsSocket = null;
  dispatchSocket = null;
  trackingSocket = null;
}
