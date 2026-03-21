import { Request } from 'express';
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: Role;
  };
}
