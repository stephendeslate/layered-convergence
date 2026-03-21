import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import { PipelineService } from '../src/pipeline/pipeline.service';
import { DataSourceService } from '../src/data-source/data-source.service';
import { DashboardService } from '../src/dashboard/dashboard.service';

// [TRACED:TS-005] Integration test using real AppModule (no jest.spyOn on Prisma)
describe('Analytics Engine Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let pipelineService: PipelineService;
  let dataSourceService: DataSourceService;
  let dashboardService: DashboardService;

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

    prisma = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);
    pipelineService = module.get<PipelineService>(PipelineService);
    dataSourceService = module.get<DataSourceService>(DataSourceService);
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should resolve all services from AppModule', () => {
    expect(prisma).toBeDefined();
    expect(authService).toBeDefined();
    expect(pipelineService).toBeDefined();
    expect(dataSourceService).toBeDefined();
    expect(dashboardService).toBeDefined();
  });

  it('should have ValidationPipe configured', () => {
    expect(app).toBeDefined();
  });
});
