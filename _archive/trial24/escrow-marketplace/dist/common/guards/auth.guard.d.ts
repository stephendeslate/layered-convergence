import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
export declare const IS_PUBLIC_KEY = "isPublic";
export declare class AuthGuard implements CanActivate {
    private readonly configService;
    private readonly reflector;
    constructor(configService: ConfigService, reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
    private extractToken;
}
