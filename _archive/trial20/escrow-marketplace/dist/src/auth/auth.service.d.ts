import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        token: string;
    }>;
}
