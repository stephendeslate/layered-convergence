import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { PrismaService } from "../common/prisma.service";

// [TRACED:UT-002] Transaction service unit tests
describe("TransactionService", () => {
  let service: TransactionService;
  let prisma: Record<string, jest.Mock | Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      transaction: { create: jest.fn(), findFirst: jest.fn(), update: jest.fn(), findMany: jest.fn() },
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

  it("should allow PENDING -> FUNDED", async () => {
    (prisma.transaction as Record<string, jest.Mock>).findFirst.mockResolvedValue({ id: "t1", status: "PENDING" });
    (prisma.transaction as Record<string, jest.Mock>).update.mockResolvedValue({ id: "t1", status: "FUNDED" });
    const result = await service.transitionTransaction("t1", "FUNDED");
    expect(result.status).toBe("FUNDED");
  });

  it("should reject PENDING -> COMPLETED", async () => {
    (prisma.transaction as Record<string, jest.Mock>).findFirst.mockResolvedValue({ id: "t1", status: "PENDING" });
    await expect(service.transitionTransaction("t1", "COMPLETED")).rejects.toThrow(BadRequestException);
  });

  it("should set user context via $executeRaw", async () => {
    await service.setUserContext("user-1");
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });
});
