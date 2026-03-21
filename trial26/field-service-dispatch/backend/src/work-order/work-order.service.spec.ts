import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { WorkOrderService } from "./work-order.service";
import { PrismaService } from "../common/prisma.service";

// [TRACED:UT-002] WorkOrder service unit tests
describe("WorkOrderService", () => {
  let service: WorkOrderService;
  let prisma: { workOrder: { create: jest.Mock; findFirst: jest.Mock; update: jest.Mock; findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { workOrder: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn(), findMany: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrderService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WorkOrderService>(WorkOrderService);
  });

  it("should create a work order", async () => {
    prisma.workOrder.create.mockResolvedValue({ id: "wo1", status: "CREATED" });
    const result = await service.createWorkOrder({ title: "Fix AC", customerId: "c1", companyId: "co1" });
    expect(result.status).toBe("CREATED");
  });

  it("should allow CREATED -> ASSIGNED with technician", async () => {
    prisma.workOrder.findFirst.mockResolvedValue({ id: "wo1", status: "CREATED" });
    prisma.workOrder.update.mockResolvedValue({ id: "wo1", status: "ASSIGNED", technicianId: "t1" });
    const result = await service.assignTechnician("wo1", "t1");
    expect(result.status).toBe("ASSIGNED");
  });

  it("should reject assignment if not CREATED", async () => {
    prisma.workOrder.findFirst.mockResolvedValue({ id: "wo1", status: "IN_PROGRESS" });
    await expect(service.assignTechnician("wo1", "t1")).rejects.toThrow(BadRequestException);
  });

  it("should allow IN_PROGRESS -> COMPLETED", async () => {
    prisma.workOrder.findFirst.mockResolvedValue({ id: "wo1", status: "IN_PROGRESS" });
    prisma.workOrder.update.mockResolvedValue({ id: "wo1", status: "COMPLETED" });
    const result = await service.transitionWorkOrder("wo1", "COMPLETED");
    expect(result.status).toBe("COMPLETED");
  });

  it("should reject COMPLETED -> any", async () => {
    prisma.workOrder.findFirst.mockResolvedValue({ id: "wo1", status: "COMPLETED" });
    await expect(service.transitionWorkOrder("wo1", "IN_PROGRESS")).rejects.toThrow(BadRequestException);
  });
});
