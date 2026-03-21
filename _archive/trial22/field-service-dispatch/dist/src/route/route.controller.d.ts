import { RouteService } from './route.service.js';
import { CreateRouteDto } from './dto/create-route.dto.js';
export declare class RouteController {
    private readonly routeService;
    constructor(routeService: RouteService);
    create(dto: CreateRouteDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        technicianId: string;
        date: Date;
        waypoints: import("@prisma/client/runtime/library").JsonValue;
        optimizedOrder: import("@prisma/client/runtime/library").JsonValue | null;
        estimatedDuration: number | null;
    }>;
    findByTechnician(technicianId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        technicianId: string;
        date: Date;
        waypoints: import("@prisma/client/runtime/library").JsonValue;
        optimizedOrder: import("@prisma/client/runtime/library").JsonValue | null;
        estimatedDuration: number | null;
    }[]>;
    optimize(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        technicianId: string;
        date: Date;
        waypoints: import("@prisma/client/runtime/library").JsonValue;
        optimizedOrder: import("@prisma/client/runtime/library").JsonValue | null;
        estimatedDuration: number | null;
    }>;
}
