import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// TRACED:AC-002: All other endpoints require JWT Bearer token
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
