import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        createdAt: Date;
    }[]>;
    findById(id: string, tenantId: string): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
    } | null>;
    update(id: string, dto: UpdateUserDto, tenantId: string): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        updatedAt: Date;
    }>;
    remove(id: string, tenantId: string): Promise<{
        deleted: boolean;
    }>;
}
