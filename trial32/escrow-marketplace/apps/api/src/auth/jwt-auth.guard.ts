// [TRACED:EM-SA-003b] JwtAuthGuard protects endpoints
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
