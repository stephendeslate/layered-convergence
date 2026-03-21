import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly config;
    constructor(prisma: PrismaService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        user: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            tenantId: string;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            tenantId: string;
        };
        token: string;
    }>;
    private generateToken;
}
