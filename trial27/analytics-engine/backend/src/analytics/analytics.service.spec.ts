// [TRACED:AE-033] Analytics service unit tests with mocked dependencies
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { PrismaService } from "../common/prisma.service";
import { TenantService } from "../tenant/tenant.service";

describe("AnalyticsService", () => {
  let service: AnalyticsService;
  let prisma: {
    dashboard: { findMany: jest.Mock };
    pipeline: { create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    dataPoint: { findMany: jest.Mock };
    embed: { create: jest.Mock };
  };
  let tenantService: { setTenantContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      dashboard: { findMany: jest.fn() },
      pipeline: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      dataPoint: { findMany: jest.fn() },
      embed: { create: jest.fn() },
    };
    tenantService = { setTenantContext: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantService, useValue: tenantService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it("should get dashboards with tenant context", async () => {
    prisma.dashboard.findMany.mockResolvedValue([
      { id: "d1", name: "Sales Dashboard" },
    ]);

    const result = await service.getDashboards("tenant-1");

    expect(tenantService.setTenantContext).toHaveBeenCalledWith("tenant-1");
    expect(result).toHaveLength(1);
  });

  it("should reject invalid pipeline transitions", async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      id: "p1",
      status: "ARCHIVED",
    });

    await expect(
      service.transitionPipeline("p1", "ACTIVE"),
    ).rejects.toThrow(BadRequestException);
  });

  it("should allow valid pipeline transitions", async () => {
    prisma.pipeline.findFirst.mockResolvedValue({
      id: "p1",
      status: "DRAFT",
    });
    prisma.pipeline.update.mockResolvedValue({
      id: "p1",
      status: "ACTIVE",
    });

    const result = await service.transitionPipeline("p1", "ACTIVE");

    expect(result.status).toBe("ACTIVE");
  });
});
