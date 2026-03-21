export declare class CreateWorkOrderDto {
    companyId: string;
    customerId: string;
    technicianId?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    scheduledAt?: string;
    description: string;
    notes?: string;
}
