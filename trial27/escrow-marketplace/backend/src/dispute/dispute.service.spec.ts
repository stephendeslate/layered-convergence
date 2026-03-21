// [TRACED:EM-034] Dispute service unit tests
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { DisputeService } from "./dispute.service";
import { PrismaService } from "../common/prisma.service";

describe("DisputeService", () => {
  let service: DisputeService;
  let prisma: {
    dispute: { create: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      dispute: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
  });

  it("should create a dispute", async () => {
    prisma.dispute.create.mockResolvedValue({
      id: "d1",
      transactionId: "t1",
      status: "OPEN",
    });

    const result = await service.create({
      transactionId: "t1",
      filedBy: "user-1",
      reason: "Item not received",
    });

    expect(result.status).toBe("OPEN");
  });

  it("should reject resolving already resolved disputes", async () => {
    prisma.dispute.findFirst.mockResolvedValue({
      id: "d1",
      status: "RESOLVED_BUYER",
    });

    await expect(
      service.resolve("d1", "Refund issued", "RESOLVED_BUYER"),
    ).rejects.toThrow(BadRequestException);
  });

  it("should resolve an open dispute", async () => {
    prisma.dispute.findFirst.mockResolvedValue({
      id: "d1",
      status: "OPEN",
    });
    prisma.dispute.update.mockResolvedValue({
      id: "d1",
      status: "RESOLVED_SELLER",
      resolution: "Seller provided proof",
    });

    const result = await service.resolve(
      "d1",
      "Seller provided proof",
      "RESOLVED_SELLER",
    );

    expect(result.status).toBe("RESOLVED_SELLER");
  });
});
