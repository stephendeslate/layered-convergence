import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@field-service/shared';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
