import { BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { CompanyContextMiddleware } from './company-context.middleware.js';

describe('CompanyContextMiddleware', () => {
  let middleware: CompanyContextMiddleware;

  beforeEach(() => {
    middleware = new CompanyContextMiddleware();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should set companyId on request when header is present', () => {
    const req = { headers: { 'x-company-id': 'company-1' } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    middleware.use(req, res, next);

    expect((req as Request & { companyId: string }).companyId).toBe('company-1');
    expect(next).toHaveBeenCalled();
  });

  it('should throw BadRequestException when header is missing', () => {
    const req = { headers: {} } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when header is empty string', () => {
    const req = { headers: { 'x-company-id': '' } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException when header is an array', () => {
    const req = { headers: { 'x-company-id': ['a', 'b'] } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    expect(() => middleware.use(req, res, next)).toThrow(BadRequestException);
  });

  it('should include descriptive error message', () => {
    const req = { headers: {} } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    expect(() => middleware.use(req, res, next)).toThrow(
      'x-company-id header is required',
    );
  });
});
