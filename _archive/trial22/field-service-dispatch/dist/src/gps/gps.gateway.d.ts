import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
interface PositionUpdate {
    technicianId: string;
    lat: number;
    lng: number;
}
export declare class GpsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(_client: Socket): void;
    handlePositionUpdate(data: PositionUpdate, client: Socket): {
        event: string;
        data: {
            received: boolean;
        };
    };
}
export {};
