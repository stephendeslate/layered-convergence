import { UserRole } from '@prisma/client';
export interface RequestUser {
    sub: string;
    email: string;
    role: UserRole;
    tenantId: string;
}
