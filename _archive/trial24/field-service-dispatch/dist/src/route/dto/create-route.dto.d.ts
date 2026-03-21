export declare class CreateRouteDto {
    technicianId: string;
    date: string;
    waypoints: Array<{
        lat: number;
        lng: number;
        label?: string;
    }>;
    estimatedDuration?: number;
}
