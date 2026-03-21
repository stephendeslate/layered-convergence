// [TRACED:AC-010] JwtAuthGuard protects authenticated endpoints
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
