import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.slice(7);
    try {
      const decoded = this.jwtService.verify<{
        sub: string;
        email: string;
        role: string;
        companyId: string;
      }>(token);

      request.companyId = decoded.companyId;
      request.userId = decoded.sub;
      request.userRole = decoded.role;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
