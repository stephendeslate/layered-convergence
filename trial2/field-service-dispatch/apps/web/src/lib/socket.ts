import { io, Socket } from 'socket.io-client';

const GPS_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getGpsSocket(): Socket {
  if (!socket) {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    socket = io(`${GPS_URL}/gps`, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    });
  }

  return socket;
}

export function disconnectGpsSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
