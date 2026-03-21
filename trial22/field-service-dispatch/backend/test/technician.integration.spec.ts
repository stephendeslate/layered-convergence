// Integration tests for TechnicianService — REAL database, NO Prisma mocking

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TechnicianModule } from '../src/technician/technician.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TechnicianService } from '../src/technician/technician.service';

describe('TechnicianService Integration', () => {
  let module: TestingModule;
  let technicianService: TechnicianService;
  let prisma: PrismaService;
  let companyId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TechnicianModule, PrismaModule],
    }).compile();

    technicianService = module.get<TechnicianService>(TechnicianService);
    prisma = module.get<PrismaService>(PrismaService);

    const company = await prisma.company.create({
      data: { name: 'Technician Test Company' },
    });
    companyId = company.id;
  });

  afterAll(async () => {
    await prisma.technician.deleteMany({ where: { companyId } });
    await prisma.company.deleteMany({ where: { id: companyId } });
    await module.close();
  });

  it('should create a technician', async () => {
    const technician = await technicianService.create(
      {
        name: 'Mike Johnson',
        phone: '555-0300',
        specialties: 'HVAC, Electrical',
      },
      companyId,
    );

    expect(technician).toBeDefined();
    expect(technician.name).toBe('Mike Johnson');
    expect(technician.specialties).toBe('HVAC, Electrical');
    expect(technician.companyId).toBe(companyId);
  });

  it('should list technicians for a company', async () => {
    const technicians = await technicianService.findAll(companyId);

    expect(technicians.length).toBeGreaterThanOrEqual(1);
    for (const t of technicians) {
      expect(t.companyId).toBe(companyId);
    }
  });

  it('should find a technician by ID', async () => {
    const created = await technicianService.create(
      {
        name: 'Sarah Connor',
        specialties: 'Plumbing',
      },
      companyId,
    );

    const found = await technicianService.findOne(created.id, companyId);
    expect(found.id).toBe(created.id);
    expect(found.name).toBe('Sarah Connor');
  });

  it('should throw NotFoundException for non-existent technician', async () => {
    await expect(
      technicianService.findOne('00000000-0000-0000-0000-000000000000', companyId),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update a technician', async () => {
    const created = await technicianService.create(
      {
        name: 'Original Tech',
      },
      companyId,
    );

    const updated = await technicianService.update(
      created.id,
      { name: 'Updated Tech', phone: '555-0400' },
      companyId,
    );

    expect(updated.name).toBe('Updated Tech');
    expect(updated.phone).toBe('555-0400');
  });
});
