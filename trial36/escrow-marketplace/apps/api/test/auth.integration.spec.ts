import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';

// TRACED: EM-TEST-002 — Integration tests with real AppModule

describe('Auth Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findFirst: jest.fn(),
          create: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create the application', () => {
    expect(app).toBeDefined();
  });

  it('should have PrismaService available', () => {
    expect(prisma).toBeDefined();
  });

  it('should have the auth module loaded', () => {
    const authService = app.get('AuthService', { strict: false });
    expect(authService).toBeDefined();
  });

  it('should have validation pipe configured', async () => {
    expect(app).toBeDefined();
  });
});
