import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
