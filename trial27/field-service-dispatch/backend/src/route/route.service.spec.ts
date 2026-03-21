// [TRACED:FD-034] Route service tests: route lifecycle and transitions
import { Test, TestingModule } from "@nestjs/testing";
import { RouteService } from "./route.service";
import { PrismaService } from "../common/prisma.service";
import { CompanyService } from "../company/company.service";
import { BadRequestException } from "@nestjs/common";

describe("RouteService", () => {
  let service: RouteService;
  let prisma: {
    route: { findFirst: jest.Mock; update: jest.Mock; create: jest.Mock; findMany: jest.Mock };
  };
  let companyService: { setCompanyContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      route: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    companyService = {
      setCompanyContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        { provide: PrismaService, useValue: prisma },
        { provide: CompanyService, useValue: companyService },
      ],
    }).compile();

    service = module.get<RouteService>(RouteService);
  });

  it("should reject invalid route transitions (COMPLETED -> ACTIVE)", async () => {
    prisma.route.findFirst.mockResolvedValue({
      id: "route-1",
      status: "COMPLETED",
    });

    await expect(
      service.transition("route-1", "ACTIVE", "company-1"),
    ).rejects.toThrow(BadRequestException);
  });

  it("should accept valid route transitions (PLANNED -> ACTIVE)", async () => {
    prisma.route.findFirst.mockResolvedValue({
      id: "route-1",
      status: "PLANNED",
    });
    prisma.route.update.mockResolvedValue({
      id: "route-1",
      status: "ACTIVE",
    });

    const result = await service.transition("route-1", "ACTIVE", "company-1");
    expect(result.status).toBe("ACTIVE");
  });

  it("should throw when route not found", async () => {
    prisma.route.findFirst.mockResolvedValue(null);

    await expect(
      service.transition("nonexistent", "ACTIVE", "company-1"),
    ).rejects.toThrow(BadRequestException);
  });
});
