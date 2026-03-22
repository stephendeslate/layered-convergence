import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// TRACED: AE-AUTH-010
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
