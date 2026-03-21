import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService, JwtPayload } from './auth.service';
import * as jwt from 'jsonwebtoken';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    process.env['JWT_SECRET'] = 'test-secret-key';
    process.env['JWT_EXPIRES_IN'] = '3600';
    service = new AuthService();
  });

  afterEach(() => {
    delete process.env['JWT_SECRET'];
    delete process.env['JWT_EXPIRES_IN'];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return a valid JWT token', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        tenantId: 'tenant-1',
        role: 'admin',
      };

      const result = service.sign(payload);

      expect(result.accessToken).toBeDefined();
      expect(typeof result.accessToken).toBe('string');
      expect(result.expiresIn).toBe(3600);
    });

    it('should produce a token that can be decoded', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        tenantId: 'tenant-1',
        role: 'viewer',
      };

      const result = service.sign(payload);
      const decoded = jwt.decode(result.accessToken) as JwtPayload;

      expect(decoded.sub).toBe('user-1');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.tenantId).toBe('tenant-1');
      expect(decoded.role).toBe('viewer');
    });

    it('should include iat and exp in the token', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        tenantId: 'tenant-1',
        role: 'admin',
      };

      const result = service.sign(payload);
      const decoded = jwt.decode(result.accessToken) as JwtPayload;

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp! - decoded.iat!).toBe(3600);
    });
  });

  describe('verify', () => {
    it('should verify a valid token', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        tenantId: 'tenant-1',
        role: 'admin',
      };

      const { accessToken } = service.sign(payload);
      const result = service.verify(accessToken);

      expect(result.sub).toBe('user-1');
      expect(result.email).toBe('test@example.com');
      expect(result.tenantId).toBe('tenant-1');
    });

    it('should throw UnauthorizedException for invalid token', () => {
      expect(() => service.verify('invalid-token')).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired token', () => {
      const token = jwt.sign(
        { sub: 'user-1', email: 'test@example.com', tenantId: 'tenant-1', role: 'admin' },
        'test-secret-key',
        { expiresIn: -1 },
      );

      expect(() => service.verify(token)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for token with wrong secret', () => {
      const token = jwt.sign(
        { sub: 'user-1', email: 'test@example.com', tenantId: 'tenant-1', role: 'admin' },
        'wrong-secret',
      );

      expect(() => service.verify(token)).toThrow(UnauthorizedException);
    });
  });

  describe('validate', () => {
    it('should return the payload when valid', () => {
      const payload: JwtPayload = {
        sub: 'user-1',
        email: 'test@example.com',
        tenantId: 'tenant-1',
        role: 'admin',
      };

      expect(service.validate(payload)).toEqual(payload);
    });

    it('should throw UnauthorizedException when sub is missing', () => {
      const payload = {
        sub: '',
        email: 'test@example.com',
        tenantId: 'tenant-1',
        role: 'admin',
      } as JwtPayload;

      expect(() => service.validate(payload)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when tenantId is missing', () => {
      const payload = {
        sub: 'user-1',
        email: 'test@example.com',
        tenantId: '',
        role: 'admin',
      } as JwtPayload;

      expect(() => service.validate(payload)).toThrow(UnauthorizedException);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer header', () => {
      const token = service.extractTokenFromHeader('Bearer my-token');
      expect(token).toBe('my-token');
    });

    it('should return null for undefined header', () => {
      expect(service.extractTokenFromHeader(undefined)).toBeNull();
    });

    it('should return null for non-Bearer header', () => {
      expect(service.extractTokenFromHeader('Basic abc123')).toBeNull();
    });

    it('should return null for Bearer with no token', () => {
      expect(service.extractTokenFromHeader('Bearer')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(service.extractTokenFromHeader('')).toBeNull();
    });
  });
});
