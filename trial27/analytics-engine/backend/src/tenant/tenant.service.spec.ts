// [TRACED:AE-034] Tenant service unit tests for context setting
import { Test, TestingModule } from "@nestjs/testing";
import { TenantService } from "./tenant.service";
import { PrismaService } from "../common/prisma.service";

describe("TenantService", () => {
  let service: TenantService;
  let prisma: {
    $executeRaw: jest.Mock;
    tenant: { findMany: jest.Mock; create: jest.Mock };
  };

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
    prisma.$executeRaw.mockResolvedValue(undefined);

    await service.setTenantContext("tenant-1");

    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it("should find all tenants", async () => {
    prisma.tenant.findMany.mockResolvedValue([
      { id: "t1", name: "Acme Corp", slug: "acme" },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Acme Corp");
  });

  it("should create a tenant", async () => {
    prisma.tenant.create.mockResolvedValue({
      id: "t2",
      name: "New Tenant",
      slug: "new-tenant",
    });

    const result = await service.create({
      name: "New Tenant",
      slug: "new-tenant",
    });

    expect(result.slug).toBe("new-tenant");
  });
});
