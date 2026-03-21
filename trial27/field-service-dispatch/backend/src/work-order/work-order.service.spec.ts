// [TRACED:FD-033] Work order service tests: state machine enforcement
import { Test, TestingModule } from "@nestjs/testing";
import { WorkOrderService } from "./work-order.service";
import { PrismaService } from "../common/prisma.service";
import { CompanyService } from "../company/company.service";
import { BadRequestException } from "@nestjs/common";

describe("WorkOrderService", () => {
  let service: WorkOrderService;
  let prisma: {
    workOrder: { findFirst: jest.Mock; update: jest.Mock; create: jest.Mock };
  };
  let companyService: { setCompanyContext: jest.Mock };

  beforeEach(async () => {
    prisma = {
      workOrder: {
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };

    companyService = {
      setCompanyContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: prisma },
        { provide: CompanyService, useValue: companyService },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
  });

  it("should reject invalid state transitions (COMPLETED -> CREATED)", async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: "wo-1",
      status: "COMPLETED",
    });

    await expect(
      service.transition("wo-1", "CREATED", "company-1"),
    ).rejects.toThrow(BadRequestException);
  });

  it("should accept valid state transitions (CREATED -> ASSIGNED)", async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: "wo-1",
      status: "CREATED",
    });
    prisma.workOrder.update.mockResolvedValue({
      id: "wo-1",
      status: "ASSIGNED",
    });

    const result = await service.transition("wo-1", "ASSIGNED", "company-1");
    expect(result.status).toBe("ASSIGNED");
  });

  it("should set company context before operations", async () => {
    prisma.workOrder.findFirst.mockResolvedValue({
      id: "wo-1",
      status: "ASSIGNED",
    });
    prisma.workOrder.update.mockResolvedValue({
      id: "wo-1",
      status: "EN_ROUTE",
    });

    await service.transition("wo-1", "EN_ROUTE", "company-1");
    expect(companyService.setCompanyContext).toHaveBeenCalledWith("company-1");
  });
});
