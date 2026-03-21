import { HttpStatus } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma-exception.filter';

function createMockHost(statusFn: ReturnType<typeof vi.fn>, jsonFn: ReturnType<typeof vi.fn>) {
  return {
    switchToHttp: () => ({
      getResponse: () => ({
        status: statusFn.mockReturnThis(),
        json: jsonFn,
      }),
    }),
  };
}

function createPrismaError(code: string) {
  const error = new Error('Prisma error') as any;
  error.code = code;
  error.clientVersion = '6.0.0';
  error.name = 'PrismaClientKnownRequestError';
  return error;
}

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let statusFn: ReturnType<typeof vi.fn>;
  let jsonFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
    statusFn = vi.fn().mockReturnThis();
    jsonFn = vi.fn();
  });

  it('should map P2002 to 409 CONFLICT', () => {
    const host = createMockHost(statusFn, jsonFn);
    filter.catch(createPrismaError('P2002'), host as any);
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 409, error: 'P2002' }),
    );
  });

  it('should map P2025 to 404 NOT_FOUND', () => {
    const host = createMockHost(statusFn, jsonFn);
    filter.catch(createPrismaError('P2025'), host as any);
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('should map P2003 to 400 BAD_REQUEST', () => {
    const host = createMockHost(statusFn, jsonFn);
    filter.catch(createPrismaError('P2003'), host as any);
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should map P2014 to 400 BAD_REQUEST', () => {
    const host = createMockHost(statusFn, jsonFn);
    filter.catch(createPrismaError('P2014'), host as any);
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should map unknown Prisma errors to 500', () => {
    const host = createMockHost(statusFn, jsonFn);
    filter.catch(createPrismaError('P9999'), host as any);
    expect(statusFn).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
