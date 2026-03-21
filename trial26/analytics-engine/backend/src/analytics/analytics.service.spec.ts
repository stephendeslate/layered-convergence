import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { PrismaService } from "../common/prisma.service";

// [TRACED:UT-002] Analytics service unit tests
describe("AnalyticsService", () => {
  let service: AnalyticsService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      pipeline: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
      dashboard: { create: jest.fn(), findMany: jest.fn() },
      dataSource: { create: jest.fn(), findMany: jest.fn() },
      syncRun: { create: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  describe("pipeline state machine", () => {
    it("should allow DRAFT -> ACTIVE", async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: "p1", status: "DRAFT" });
      prisma.pipeline.update.mockResolvedValue({ id: "p1", status: "ACTIVE" });

      const result = await service.transitionPipeline("p1", "ACTIVE");
      expect(result.status).toBe("ACTIVE");
    });

    it("should reject DRAFT -> PAUSED", async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: "p1", status: "DRAFT" });

      await expect(service.transitionPipeline("p1", "PAUSED")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should reject ARCHIVED -> any", async () => {
      prisma.pipeline.findFirst.mockResolvedValue({ id: "p1", status: "ARCHIVED" });

      await expect(service.transitionPipeline("p1", "ACTIVE")).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("dashboards", () => {
    it("should create a dashboard", async () => {
      prisma.dashboard.create.mockResolvedValue({
        id: "d1",
        name: "Sales",
        tenantId: "t1",
      });

      const result = await service.createDashboard("t1", "Sales", "u1");
      expect(result.name).toBe("Sales");
    });
  });

  describe("sync runs", () => {
    it("should create a pending sync run", async () => {
      prisma.syncRun.create.mockResolvedValue({
        id: "sr1",
        status: "PENDING",
      });

      const result = await service.startSyncRun("ds1");
      expect(result.status).toBe("PENDING");
    });
  });
});
