// TRACED:AE-AUTH-07 — JwtAuthGuard extending Passport AuthGuard

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
