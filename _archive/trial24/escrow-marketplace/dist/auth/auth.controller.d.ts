import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
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
}
