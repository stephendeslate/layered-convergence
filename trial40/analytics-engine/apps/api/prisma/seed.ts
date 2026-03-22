// TRACED:AE-INFRA-01 — Seed with error/failure states, BCRYPT_SALT_ROUNDS from shared
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Analytics',
      slug: 'acme-analytics',
    },
  });

  const adminPassword = await bcrypt.hash('admin123', BCRYPT_SALT_ROUNDS);
  const editorPassword = await bcrypt.hash('editor123', BCRYPT_SALT_ROUNDS);
  const viewerPassword = await bcrypt.hash('viewer123', BCRYPT_SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: 'editor@acme.com',
      password: editorPassword,
      name: 'Editor User',
      role: 'EDITOR',
      tenantId: tenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'viewer@acme.com',
      password: viewerPassword,
      name: 'Viewer User',
      role: 'VIEWER',
      tenantId: tenant.id,
    },
  });

  await prisma.event.createMany({
    data: [
      { type: 'PAGE_VIEW', name: 'Homepage Visit', tenantId: tenant.id },
      { type: 'CLICK', name: 'CTA Button Click', tenantId: tenant.id },
      { type: 'CONVERSION', name: 'Signup Complete', tenantId: tenant.id },
      { type: 'CUSTOM', name: 'Error Event', payload: JSON.parse('{"error": "timeout"}'), tenantId: tenant.id },
    ],
  });

  await prisma.dashboard.createMany({
    data: [
      { title: 'Overview Dashboard', description: 'Main analytics overview', isPublic: true, tenantId: tenant.id, userId: admin.id },
      { title: 'Private Dashboard', description: null, isPublic: false, tenantId: tenant.id, userId: editor.id },
    ],
  });

  const dbSource = await prisma.dataSource.create({
    data: {
      name: 'Production Database',
      type: 'DATABASE',
      config: JSON.parse('{"host": "db.example.com", "port": 5432}'),
      cost: 99.99,
      tenantId: tenant.id,
    },
  });

  const apiSource = await prisma.dataSource.create({
    data: {
      name: 'Failed API Source',
      type: 'API',
      config: JSON.parse('{"url": "https://api.broken.example"}'),
      cost: 0,
      tenantId: tenant.id,
    },
  });

  await prisma.pipeline.createMany({
    data: [
      { name: 'ETL Pipeline', description: 'Main data pipeline', status: 'COMPLETED', schedule: '0 * * * *', tenantId: tenant.id, dataSourceId: dbSource.id },
      { name: 'Failed Pipeline', description: 'This pipeline encountered an error', status: 'FAILED', tenantId: tenant.id, dataSourceId: apiSource.id },
      { name: 'Running Pipeline', status: 'RUNNING', tenantId: tenant.id, dataSourceId: dbSource.id },
    ],
  });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
