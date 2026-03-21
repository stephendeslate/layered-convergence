import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestUser } from '../common/interfaces/request-user.interface';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(user: RequestUser): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        createdAt: Date;
    }[]>;
    getProfile(user: RequestUser): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(id: string, user: RequestUser): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto, user: RequestUser): Promise<{
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        updatedAt: Date;
    }>;
    remove(id: string, user: RequestUser): Promise<{
        deleted: boolean;
    }>;
}
