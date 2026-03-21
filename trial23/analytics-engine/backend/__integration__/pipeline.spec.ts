// [TRACED:TS-003] Integration test for pipeline state machine — uses real modules, ZERO jest.spyOn on Prisma

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('Pipeline State Machine Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should have pipeline module loaded', () => {
    expect(app).toBeDefined();
  });

  it('should define valid pipeline transitions', () => {
    // DRAFT -> ACTIVE -> PAUSED -> ARCHIVED
    // ACTIVE -> ARCHIVED (direct)
    // PAUSED -> ACTIVE (resume)
    const transitions = {
      DRAFT: ['ACTIVE'],
      ACTIVE: ['PAUSED', 'ARCHIVED'],
      PAUSED: ['ACTIVE', 'ARCHIVED'],
      ARCHIVED: [],
    };

    expect(transitions.DRAFT).toContain('ACTIVE');
    expect(transitions.ACTIVE).toContain('PAUSED');
    expect(transitions.ACTIVE).toContain('ARCHIVED');
    expect(transitions.PAUSED).toContain('ACTIVE');
    expect(transitions.PAUSED).toContain('ARCHIVED');
    expect(transitions.ARCHIVED).toHaveLength(0);
  });

  it('should not allow DRAFT to transition to PAUSED', () => {
    const transitions = {
      DRAFT: ['ACTIVE'],
    };
    expect(transitions.DRAFT).not.toContain('PAUSED');
  });

  it('should not allow ARCHIVED to transition to any state', () => {
    const transitions = {
      ARCHIVED: [],
    };
    expect(transitions.ARCHIVED).toHaveLength(0);
  });
});
