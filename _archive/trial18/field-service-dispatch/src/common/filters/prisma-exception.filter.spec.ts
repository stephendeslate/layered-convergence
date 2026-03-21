import { PrismaExceptionFilter } from './prisma-exception.filter.js';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

const createMockHost = () => {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const response = { status, json };
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
};

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException with object response', () => {
    const { host, status, json } = createMockHost();
    const exception = new HttpException({ statusCode: 400, message: 'Bad' }, 400);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
  });

  it('should handle HttpException with string response', () => {
    const { host, status, json } = createMockHost();
    const exception = new HttpException('Not Found', 404);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ statusCode: 404, message: 'Not Found' });
  });

  it('should handle P2002 (unique constraint) as 409', () => {
    const { host, status, json } = createMockHost();
    const exception = { code: 'P2002', message: 'Unique constraint failed' };

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'P2002' }),
    );
  });

  it('should handle P2025 (record not found) as 404', () => {
    const { host, status, json } = createMockHost();
    const exception = { code: 'P2025', message: 'Record not found' };

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('should handle P2003 (foreign key) as 400', () => {
    const { host, status, json } = createMockHost();
    const exception = { code: 'P2003', message: 'Foreign key constraint' };

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should handle unknown Prisma error as 500', () => {
    const { host, status, json } = createMockHost();
    const exception = { code: 'P9999', message: 'Unknown' };

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('should handle non-Prisma unknown errors as 500', () => {
    const { host, status, json } = createMockHost();
    const exception = new Error('something broke');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
    });
  });
});
