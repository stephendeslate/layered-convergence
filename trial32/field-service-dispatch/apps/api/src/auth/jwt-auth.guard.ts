import { Injectable } from '@nestjs/common';
// [TRACED:FD-SA-003] JwtAuthGuard protects endpoints
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
