import { Test, TestingModule } from "@nestjs/testing";
import { TenantService } from "./tenant.service";
import { PrismaService } from "../common/prisma.service";

// [TRACED:UT-003] Tenant service unit tests
describe("TenantService", () => {
  let service: TenantService;
  let prisma: Record<string, jest.Mock | Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      $executeRaw: jest.fn(),
      tenant: { findMany: jest.fn(), create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  it("should set tenant context via $executeRaw", async () => {
    await service.setTenantContext("tenant-1");
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it("should clear tenant context", async () => {
    await service.clearTenantContext();
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it("should list tenants", async () => {
    const tenants = [{ id: "t1", name: "Acme", slug: "acme" }];
    (prisma.tenant as Record<string, jest.Mock>).findMany.mockResolvedValue(tenants);

    const result = await service.getTenants();
    expect(result).toEqual(tenants);
  });
});
