import { Test, TestingModule } from "@nestjs/testing";
import { CompanyService } from "./company.service";
import { PrismaService } from "../common/prisma.service";

// [TRACED:UT-003] Company service unit tests
describe("CompanyService", () => {
  let service: CompanyService;
  let prisma: Record<string, jest.Mock | Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      $executeRaw: jest.fn(),
      company: { findMany: jest.fn(), create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  it("should set company context via $executeRaw", async () => {
    await service.setCompanyContext("company-1");
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it("should clear company context", async () => {
    await service.clearCompanyContext();
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it("should list companies", async () => {
    const companies = [{ id: "c1", name: "Acme", slug: "acme" }];
    (prisma.company as Record<string, jest.Mock>).findMany.mockResolvedValue(companies);
    const result = await service.getCompanies();
    expect(result).toEqual(companies);
  });
});
