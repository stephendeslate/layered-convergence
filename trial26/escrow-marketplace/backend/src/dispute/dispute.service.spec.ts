import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { DisputeService } from "./dispute.service";
import { PrismaService } from "../common/prisma.service";

// [TRACED:UT-003] Dispute service unit tests
describe("DisputeService", () => {
  let service: DisputeService;
  let prisma: { dispute: { create: jest.Mock; findFirst: jest.Mock; update: jest.Mock } };

  beforeEach(async () => {
    prisma = { dispute: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
  });

  it("should file a dispute", async () => {
    prisma.dispute.create.mockResolvedValue({ id: "d1", status: "OPEN" });
    const result = await service.fileDispute("t1", "u1", "Item not received");
    expect(result.status).toBe("OPEN");
  });

  it("should allow OPEN -> UNDER_REVIEW", async () => {
    prisma.dispute.findFirst.mockResolvedValue({ id: "d1", status: "OPEN" });
    prisma.dispute.update.mockResolvedValue({ id: "d1", status: "UNDER_REVIEW" });
    const result = await service.transitionDispute("d1", "UNDER_REVIEW");
    expect(result.status).toBe("UNDER_REVIEW");
  });

  it("should reject RESOLVED -> any", async () => {
    prisma.dispute.findFirst.mockResolvedValue({ id: "d1", status: "RESOLVED" });
    await expect(service.transitionDispute("d1", "OPEN")).rejects.toThrow(BadRequestException);
  });
});
