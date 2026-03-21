// [TRACED:EM-033] Transaction service unit tests with mocked dependencies
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { PrismaService } from "../common/prisma.service";

describe("TransactionService", () => {
  let service: TransactionService;
  let prisma: {
    transaction: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
    };
    $executeRaw: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      $executeRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  it("should reject invalid transaction transitions", async () => {
    prisma.transaction.findFirst.mockResolvedValue({
      id: "t1",
      status: "RELEASED",
    });

    await expect(
      service.transition("t1", "FUNDED"),
    ).rejects.toThrow(BadRequestException);
  });

  it("should allow valid transition from PENDING to FUNDED", async () => {
    prisma.transaction.findFirst.mockResolvedValue({
      id: "t1",
      status: "PENDING",
    });
    prisma.transaction.update.mockResolvedValue({
      id: "t1",
      status: "FUNDED",
    });

    const result = await service.transition("t1", "FUNDED");
    expect(result.status).toBe("FUNDED");
  });

  it("should set user context via $executeRaw", async () => {
    prisma.$executeRaw.mockResolvedValue(undefined);
    prisma.transaction.findMany.mockResolvedValue([]);

    await service.findByUser("user-1");
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });
});
