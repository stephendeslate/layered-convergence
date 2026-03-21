/**
 * Comprehensive seed script for Field Service Dispatch
 * Creates demo data across 3 companies with realistic
 * multi-tenant field service operations data.
 *
 * Totals:
 *   3 companies, ~29 users (3 admin + 6 dispatcher + 20 tech),
 *   50 customers, 100 work orders, line items, 10+ invoices,
 *   routes, GPS history, status history, job photos, notifications.
 *
 * Demo credentials: Password123! for all users
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

// ============================================================
// Helpers
// ============================================================

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDecimal(min: number, max: number, decimals = 7): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function padNumber(n: number, width = 5): string {
  return String(n).padStart(width, '0');
}

// ============================================================
// Static Data
// ============================================================

const SERVICE_TYPES = [
  'HVAC_INSTALL', 'HVAC_REPAIR', 'HVAC_MAINTENANCE',
  'PLUMBING_REPAIR', 'PLUMBING_INSTALL',
  'ELECTRICAL_REPAIR', 'ELECTRICAL_INSTALL',
  'GENERAL_MAINTENANCE', 'CLEANING', 'PEST_CONTROL',
  'LANDSCAPING', 'APPLIANCE_REPAIR',
] as const;

const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'] as const;

const STATUSES = [
  'UNASSIGNED', 'ASSIGNED', 'EN_ROUTE', 'ON_SITE',
  'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID', 'CANCELLED',
] as const;

const TECH_STATUSES = ['AVAILABLE', 'EN_ROUTE', 'ON_JOB', 'ON_BREAK', 'OFF_DUTY'] as const;

const TECH_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Steven', 'Ashley',
  'Paul', 'Dorothy', 'Andrew', 'Kimberly', 'Joshua', 'Emily', 'Kenneth', 'Donna',
  'Kevin', 'Michelle', 'Brian', 'Carol', 'George', 'Amanda', 'Timothy', 'Melissa',
  'Ronald', 'Deborah', 'Edward', 'Stephanie', 'Jason', 'Rebecca', 'Jeffrey', 'Sharon',
  'Ryan', 'Laura', 'Jacob', 'Cynthia', 'Gary', 'Kathleen', 'Nicholas', 'Amy',
  'Eric', 'Angela', 'Jonathan', 'Shirley', 'Stephen', 'Anna', 'Larry', 'Brenda',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
];

const STREET_NAMES = [
  'Main St', 'Oak Ave', 'Elm Blvd', 'Pine Dr', 'Maple Ln',
  'Cedar Rd', 'Birch Way', 'Walnut St', 'Park Ave', 'Lake Dr',
  'Hill Rd', 'River St', 'Forest Ln', 'Colfax Ave', 'Broadway',
  'Federal Blvd', 'Colorado Blvd', 'Alameda Ave', 'University Blvd', 'Monaco Pkwy',
];

// ============================================================
// Company / Metro area definitions
// ============================================================

interface CompanyDef {
  name: string;
  slug: string;
  email: string;
  phone: string;
  timezone: string;
  taxRate: number;
  latCenter: number;
  lngCenter: number;
  cities: { city: string; state: string; zip: string }[];
  techCount: number;
  custCount: number;
  woCount: number;
  skillSets: string[][];
}

const COMPANY_DEFS: CompanyDef[] = [
  {
    name: 'ProServ Atlanta',
    slug: 'proserv-atlanta',
    email: 'admin@proserv-atlanta.com',
    phone: '(404) 555-0100',
    timezone: 'America/New_York',
    taxRate: 0.0875,
    latCenter: 33.749,
    lngCenter: -84.388,
    cities: [
      { city: 'Atlanta', state: 'GA', zip: '30301' },
      { city: 'Marietta', state: 'GA', zip: '30060' },
      { city: 'Decatur', state: 'GA', zip: '30030' },
    ],
    techCount: 8,
    custCount: 20,
    woCount: 40,
    skillSets: [
      ['HVAC_INSTALL', 'HVAC_REPAIR', 'HVAC_MAINTENANCE'],
      ['HVAC_REPAIR', 'HVAC_MAINTENANCE', 'GENERAL_MAINTENANCE'],
      ['PLUMBING_REPAIR', 'PLUMBING_INSTALL'],
      ['ELECTRICAL_REPAIR', 'ELECTRICAL_INSTALL'],
      ['HVAC_INSTALL', 'HVAC_REPAIR', 'ELECTRICAL_REPAIR'],
      ['PLUMBING_REPAIR', 'GENERAL_MAINTENANCE', 'APPLIANCE_REPAIR'],
      ['HVAC_MAINTENANCE', 'PEST_CONTROL', 'CLEANING'],
      ['ELECTRICAL_REPAIR', 'ELECTRICAL_INSTALL', 'APPLIANCE_REPAIR'],
    ],
  },
  {
    name: 'Mountain View Services',
    slug: 'mountain-view-services',
    email: 'admin@mountain-view-services.com',
    phone: '(303) 555-0200',
    timezone: 'America/Denver',
    taxRate: 0.0765,
    latCenter: 39.739,
    lngCenter: -104.990,
    cities: [
      { city: 'Denver', state: 'CO', zip: '80201' },
      { city: 'Aurora', state: 'CO', zip: '80010' },
      { city: 'Lakewood', state: 'CO', zip: '80226' },
    ],
    techCount: 7,
    custCount: 18,
    woCount: 35,
    skillSets: [
      ['PLUMBING_REPAIR', 'PLUMBING_INSTALL'],
      ['PLUMBING_REPAIR', 'GENERAL_MAINTENANCE'],
      ['PLUMBING_INSTALL', 'PLUMBING_REPAIR', 'APPLIANCE_REPAIR'],
      ['HVAC_REPAIR', 'HVAC_MAINTENANCE'],
      ['ELECTRICAL_REPAIR', 'ELECTRICAL_INSTALL'],
      ['GENERAL_MAINTENANCE', 'LANDSCAPING', 'CLEANING'],
      ['PLUMBING_REPAIR', 'PLUMBING_INSTALL', 'HVAC_REPAIR'],
    ],
  },
  {
    name: 'Pacific NW Pros',
    slug: 'pacific-nw-pros',
    email: 'admin@pacific-nw-pros.com',
    phone: '(503) 555-0300',
    timezone: 'America/Los_Angeles',
    taxRate: 0.0, // Oregon has no sales tax
    latCenter: 45.523,
    lngCenter: -122.676,
    cities: [
      { city: 'Portland', state: 'OR', zip: '97201' },
      { city: 'Beaverton', state: 'OR', zip: '97005' },
      { city: 'Gresham', state: 'OR', zip: '97030' },
    ],
    techCount: 5,
    custCount: 12,
    woCount: 25,
    skillSets: [
      ['ELECTRICAL_REPAIR', 'ELECTRICAL_INSTALL'],
      ['ELECTRICAL_REPAIR', 'GENERAL_MAINTENANCE'],
      ['HVAC_REPAIR', 'HVAC_INSTALL', 'HVAC_MAINTENANCE'],
      ['PLUMBING_REPAIR', 'APPLIANCE_REPAIR'],
      ['LANDSCAPING', 'PEST_CONTROL', 'CLEANING'],
    ],
  },
];

function randomOffset(center: { lat: number; lng: number }, maxKm: number) {
  const latOff = (Math.random() - 0.5) * (maxKm / 111);
  const lngOff = (Math.random() - 0.5) * (maxKm / (111 * Math.cos((center.lat * Math.PI) / 180)));
  return { lat: center.lat + latOff, lng: center.lng + lngOff };
}

// ============================================================
// Work order descriptions
// ============================================================

const WO_DESCRIPTIONS: Record<string, string[]> = {
  HVAC_INSTALL: ['Install new central AC unit, 3-ton Carrier system', 'New furnace installation', 'Mini-split system installation, 2 zones'],
  HVAC_REPAIR: ['AC not cooling, compressor clicking', 'Furnace not igniting', 'Thermostat malfunction', 'Refrigerant recharge needed'],
  HVAC_MAINTENANCE: ['Annual AC tune-up and filter change', 'Seasonal furnace inspection', 'Duct cleaning and sanitization'],
  PLUMBING_REPAIR: ['Kitchen sink drain clogged', 'Toilet running constantly', 'Water heater leaking', 'Pipe burst in basement'],
  PLUMBING_INSTALL: ['Install tankless water heater', 'Bathroom remodel plumbing', 'New sump pump installation'],
  ELECTRICAL_REPAIR: ['Multiple outlets not working', 'Circuit breaker keeps tripping', 'Light fixture flickering'],
  ELECTRICAL_INSTALL: ['EV charger installation, 240V circuit', 'Panel upgrade 100A to 200A', 'Recessed lighting install'],
  GENERAL_MAINTENANCE: ['Quarterly building inspection', 'Door frame adjustment', 'Drywall repair after leak'],
  CLEANING: ['Deep clean after renovation', 'Move-out cleaning', 'Carpet cleaning, whole house'],
  PEST_CONTROL: ['Ant infestation in kitchen', 'Termite inspection and treatment', 'Rodent control, attic'],
  LANDSCAPING: ['Spring lawn treatment and aeration', 'Tree trimming, 3 large oaks', 'Irrigation system repair'],
  APPLIANCE_REPAIR: ['Dishwasher not draining', 'Washer banging during spin', 'Refrigerator not cooling'],
};

// ============================================================
// Status weighting for realistic distribution
// ============================================================

const STATUS_WEIGHTS = [
  { status: 'UNASSIGNED' as const, weight: 10 },
  { status: 'ASSIGNED' as const, weight: 10 },
  { status: 'EN_ROUTE' as const, weight: 5 },
  { status: 'ON_SITE' as const, weight: 5 },
  { status: 'IN_PROGRESS' as const, weight: 8 },
  { status: 'COMPLETED' as const, weight: 25 },
  { status: 'INVOICED' as const, weight: 15 },
  { status: 'PAID' as const, weight: 17 },
  { status: 'CANCELLED' as const, weight: 5 },
];

function pickWeightedStatus(): string {
  const total = STATUS_WEIGHTS.reduce((s, w) => s + w.weight, 0);
  let r = Math.random() * total;
  for (const sw of STATUS_WEIGHTS) {
    r -= sw.weight;
    if (r <= 0) return sw.status;
  }
  return 'UNASSIGNED';
}

const STATUS_CHAIN = [
  'UNASSIGNED', 'ASSIGNED', 'EN_ROUTE', 'ON_SITE',
  'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID',
];

// ============================================================
// Materials catalog
// ============================================================

const MATERIALS = [
  { desc: 'Copper pipe 1/2"', price: 12.50 },
  { desc: 'PVC fitting', price: 3.75 },
  { desc: 'Wire 12 AWG (50ft)', price: 28.00 },
  { desc: 'Thermostat - programmable', price: 89.99 },
  { desc: 'Air filter MERV-13', price: 24.99 },
  { desc: 'Capacitor 40/5 MFD', price: 18.50 },
  { desc: 'Drain snake rental', price: 35.00 },
  { desc: 'Sealant tube', price: 8.99 },
  { desc: 'Breaker 20A', price: 15.99 },
  { desc: 'Refrigerant R-410A (lb)', price: 45.00 },
];

// ============================================================
// Main seed function
// ============================================================

async function main() {
  console.log('Seeding Field Service Dispatch database...');
  console.log('');

  // Clean existing data in correct order
  console.log('Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.jobPhoto.deleteMany();
  await prisma.workOrderStatusHistory.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.technicianPosition.deleteMany();
  await prisma.magicLink.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.technician.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);

  let totalUsers = 0;
  let totalTechs = 0;
  let totalCustomers = 0;
  let totalWOs = 0;
  let totalStatusHistory = 0;
  let totalLineItems = 0;
  let totalInvoices = 0;
  let totalRoutes = 0;
  let totalStops = 0;
  let totalPositions = 0;
  let totalPhotos = 0;
  let totalNotifications = 0;
  let totalAuditLogs = 0;

  // Track used name combos to avoid unique constraint violations
  let nameCounter = 0;

  for (const def of COMPANY_DEFS) {
    console.log(`\nCreating company: ${def.name}`);
    const center = { lat: def.latCenter, lng: def.lngCenter };

    // ---- Company ----
    const company = await prisma.company.create({
      data: {
        name: def.name,
        slug: def.slug,
        email: def.email,
        phone: def.phone,
        timezone: def.timezone,
        taxRate: def.taxRate,
        settings: { currency: 'USD', dateFormat: 'MM/DD/YYYY', defaultJobDuration: 60 },
      },
    });

    // ---- Admin user ----
    const admin = await prisma.user.create({
      data: {
        companyId: company.id,
        email: def.email,
        passwordHash,
        firstName: 'Admin',
        lastName: def.name.split(' ')[0],
        role: 'ADMIN',
        phone: def.phone,
        isActive: true,
      },
    });
    totalUsers++;

    // ---- 2 Dispatchers ----
    const dispatchers = [];
    for (let d = 0; d < 2; d++) {
      const fn = FIRST_NAMES[nameCounter % FIRST_NAMES.length];
      const ln = LAST_NAMES[nameCounter % LAST_NAMES.length];
      nameCounter++;
      const dispatcher = await prisma.user.create({
        data: {
          companyId: company.id,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}.d${d}@${def.slug}.com`,
          passwordHash,
          firstName: fn,
          lastName: ln,
          role: 'DISPATCHER',
          phone: `(555) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
          isActive: true,
        },
      });
      dispatchers.push(dispatcher);
      totalUsers++;
    }

    // ---- Technicians ----
    const technicians: any[] = [];
    for (let ti = 0; ti < def.techCount; ti++) {
      const fn = FIRST_NAMES[nameCounter % FIRST_NAMES.length];
      const ln = LAST_NAMES[nameCounter % LAST_NAMES.length];
      nameCounter++;

      const user = await prisma.user.create({
        data: {
          companyId: company.id,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}.t${ti}@${def.slug}.com`,
          passwordHash,
          firstName: fn,
          lastName: ln,
          role: 'TECHNICIAN',
          phone: `(555) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
          isActive: true,
        },
      });
      totalUsers++;

      const pos = randomOffset(center, 15);
      const skills = def.skillSets[ti % def.skillSets.length];
      const techStatus = randomItem(TECH_STATUSES);

      const tech = await prisma.technician.create({
        data: {
          companyId: company.id,
          userId: user.id,
          status: techStatus as any,
          skills: skills as any[],
          maxJobsPerDay: randomInt(6, 10),
          currentLatitude: pos.lat,
          currentLongitude: pos.lng,
          lastPositionAt: hoursAgo(randomInt(0, 4)),
          vehicleInfo: `${randomItem(['Ford', 'Chevy', 'Toyota', 'Ram'])} ${randomItem(['Transit', 'Express', 'Tacoma', 'ProMaster'])} #${randomInt(100, 999)}`,
          color: TECH_COLORS[ti % TECH_COLORS.length],
          simulationMode: false,
        },
      });

      technicians.push({ ...tech, userId: user.id });
      totalTechs++;

      // GPS position history: ~20 positions per technician over last 8 hours
      const numPositions = randomInt(15, 25);
      const positions = [];
      for (let p = 0; p < numPositions; p++) {
        const offset = p / numPositions;
        const baseLat = Number(tech.currentLatitude);
        const baseLng = Number(tech.currentLongitude);
        positions.push({
          companyId: company.id,
          technicianId: tech.id,
          latitude: baseLat + Math.sin(offset * Math.PI * 2) * 0.01 + randomDecimal(-0.002, 0.002),
          longitude: baseLng + Math.cos(offset * Math.PI * 2) * 0.01 + randomDecimal(-0.002, 0.002),
          accuracy: randomDecimal(3, 15, 2),
          heading: randomDecimal(0, 360, 2),
          speed: randomDecimal(0, 35, 2),
          recordedAt: hoursAgo(8 - (p * 8 / numPositions)),
        });
      }
      await prisma.technicianPosition.createMany({ data: positions });
      totalPositions += positions.length;
    }

    // ---- Customers ----
    const customers: any[] = [];
    for (let ci = 0; ci < def.custCount; ci++) {
      const fn = FIRST_NAMES[nameCounter % FIRST_NAMES.length];
      const ln = LAST_NAMES[nameCounter % LAST_NAMES.length];
      nameCounter++;

      const cityDef = def.cities[ci % def.cities.length];
      const custPos = randomOffset(center, 20);
      const streetNum = randomInt(100, 9999);
      const street = STREET_NAMES[ci % STREET_NAMES.length];

      const customer = await prisma.customer.create({
        data: {
          companyId: company.id,
          firstName: fn,
          lastName: ln,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}.${ci}@email.com`,
          phone: `(${randomInt(200, 999)}) ${randomInt(100, 999)}-${randomInt(1000, 9999)}`,
          address: `${streetNum} ${street}`,
          city: cityDef.city,
          state: cityDef.state,
          zipCode: cityDef.zip,
          latitude: custPos.lat,
          longitude: custPos.lng,
          notes: ci % 7 === 0 ? 'VIP customer - priority service' : null,
        },
      });
      customers.push(customer);
      totalCustomers++;
    }

    // ---- Work Orders ----
    const workOrders: any[] = [];
    let woCounter = 0;

    for (let wi = 0; wi < def.woCount; wi++) {
      woCounter++;
      const refNum = `WO-${padNumber(woCounter)}`;
      const status = pickWeightedStatus();
      const serviceType = randomItem(SERVICE_TYPES);
      const priority = randomItem(PRIORITIES);
      const customer = customers[wi % customers.length];
      const cityDef = def.cities[wi % def.cities.length];
      const woPos = randomOffset(center, 20);

      // Technician assigned for non-UNASSIGNED
      const needsTech = status !== 'UNASSIGNED' && !(status === 'CANCELLED' && Math.random() < 0.3);
      const tech = needsTech ? technicians[wi % technicians.length] : null;

      // Scheduling: completed/paid in the past, active today/future
      const isCompleted = ['COMPLETED', 'INVOICED', 'PAID'].includes(status);
      const isCancelled = status === 'CANCELLED';
      const scheduledStart = isCompleted || isCancelled
        ? daysAgo(randomInt(1, 30))
        : daysFromNow(randomInt(0, 7));
      const scheduledEnd = addHours(scheduledStart, randomInt(1, 3));
      const estimatedMinutes = randomItem([30, 45, 60, 90, 120, 180]);

      const actualStart = ['ON_SITE', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID'].includes(status)
        ? scheduledStart : null;
      const actualEnd = isCompleted
        ? addHours(scheduledStart, estimatedMinutes / 60) : null;

      // Tracking tokens for active WOs
      const hasTracking = ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'].includes(status) && Math.random() < 0.6;
      const trackingToken = hasTracking ? randomUUID() : null;
      const trackingExpiresAt = hasTracking ? daysFromNow(1) : null;

      const descriptions = WO_DESCRIPTIONS[serviceType] || ['General service call'];

      const wo = await prisma.workOrder.create({
        data: {
          companyId: company.id,
          customerId: customer.id,
          technicianId: tech?.id || null,
          referenceNumber: refNum,
          status: status as any,
          priority: priority as any,
          serviceType: serviceType as any,
          description: randomItem(descriptions),
          notes: wi % 4 === 0 ? 'Customer requested morning appointment' : null,
          address: `${randomInt(100, 9999)} ${randomItem(STREET_NAMES)}`,
          city: cityDef.city,
          state: cityDef.state,
          zipCode: cityDef.zip,
          latitude: woPos.lat,
          longitude: woPos.lng,
          scheduledStart,
          scheduledEnd,
          estimatedMinutes,
          actualStart,
          actualEnd,
          trackingToken,
          trackingExpiresAt,
        },
      });

      workOrders.push({ ...wo, tech, customer, status });
      totalWOs++;

      // ---- Status History ----
      const targetIdx = STATUS_CHAIN.indexOf(status);
      const chain = isCancelled
        ? STATUS_CHAIN.slice(0, randomInt(1, 5))
        : targetIdx >= 0
          ? STATUS_CHAIN.slice(0, targetIdx + 1)
          : ['UNASSIGNED'];

      const baseTime = new Date(scheduledStart.getTime() - 2 * 60 * 60 * 1000);
      for (let hi = 0; hi < chain.length; hi++) {
        await prisma.workOrderStatusHistory.create({
          data: {
            companyId: company.id,
            workOrderId: wo.id,
            fromStatus: hi === 0 ? null : (chain[hi - 1] as any),
            toStatus: chain[hi] as any,
            changedById: tech?.userId || admin.id,
            notes: hi === 0 ? 'Work order created' : undefined,
            createdAt: new Date(baseTime.getTime() + hi * 15 * 60 * 1000),
          },
        });
        totalStatusHistory++;
      }

      if (isCancelled) {
        await prisma.workOrderStatusHistory.create({
          data: {
            companyId: company.id,
            workOrderId: wo.id,
            fromStatus: chain[chain.length - 1] as any,
            toStatus: 'CANCELLED',
            changedById: admin.id,
            notes: randomItem(['Customer cancelled', 'Rescheduled', 'Duplicate order', 'Weather delay']),
            createdAt: new Date(baseTime.getTime() + chain.length * 15 * 60 * 1000),
          },
        });
        totalStatusHistory++;
      }

      // ---- Line Items (for all except UNASSIGNED) ----
      if (status !== 'UNASSIGNED') {
        const laborHours = randomDecimal(0.5, 4, 1);
        const laborRate = randomItem([75, 85, 95, 110, 125, 150]);
        const items: any[] = [
          {
            companyId: company.id,
            workOrderId: wo.id,
            type: 'LABOR',
            description: `${serviceType.replace(/_/g, ' ').toLowerCase()} labor`,
            quantity: laborHours,
            unitPrice: laborRate,
            totalPrice: parseFloat((laborHours * laborRate).toFixed(2)),
            sortOrder: 0,
          },
        ];

        // 0-3 material items
        const matCount = randomInt(0, 3);
        for (let m = 0; m < matCount; m++) {
          const mat = randomItem(MATERIALS);
          const qty = randomInt(1, 5);
          items.push({
            companyId: company.id,
            workOrderId: wo.id,
            type: 'MATERIAL',
            description: mat.desc,
            quantity: qty,
            unitPrice: mat.price,
            totalPrice: parseFloat((qty * mat.price).toFixed(2)),
            sortOrder: m + 1,
          });
        }

        // Occasional discount
        if (Math.random() < 0.12) {
          const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
          const discPct = randomItem([5, 10, 15]);
          const discAmt = parseFloat((subtotal * discPct / 100).toFixed(2));
          items.push({
            companyId: company.id,
            workOrderId: wo.id,
            type: 'DISCOUNT',
            description: `${discPct}% loyalty discount`,
            quantity: 1,
            unitPrice: -discAmt,
            totalPrice: -discAmt,
            sortOrder: items.length,
          });
        }

        await prisma.lineItem.createMany({ data: items });
        totalLineItems += items.length;
      }
    }

    // ---- Invoices (for INVOICED and PAID work orders) ----
    const invoiceableWOs = workOrders.filter(
      (wo) => wo.status === 'INVOICED' || wo.status === 'PAID',
    );
    let invCounter = 0;

    for (const wo of invoiceableWOs) {
      invCounter++;
      const lineItems = await prisma.lineItem.findMany({
        where: { workOrderId: wo.id },
      });

      const subtotal = lineItems.reduce((s, li) => s + Number(li.totalPrice), 0);
      const taxAmount = parseFloat((subtotal * def.taxRate).toFixed(2));
      const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));
      const isPaid = wo.status === 'PAID';

      await prisma.invoice.create({
        data: {
          companyId: company.id,
          customerId: wo.customer.id,
          workOrderId: wo.id,
          invoiceNumber: `INV-${padNumber(invCounter)}`,
          status: isPaid ? 'PAID' : 'SENT',
          subtotal,
          taxAmount,
          totalAmount,
          sentAt: daysAgo(randomInt(1, 14)),
          paidAt: isPaid ? daysAgo(randomInt(0, 7)) : undefined,
          dueDate: daysFromNow(randomInt(15, 30)),
          notes: isPaid ? 'Payment received - thank you!' : undefined,
          lineItems: {
            connect: lineItems.map((li) => ({ id: li.id })),
          },
        },
      });
      totalInvoices++;
    }

    // ---- Routes (for technicians with active work) ----
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const techWOMap: Record<string, any[]> = {};
    for (const wo of workOrders) {
      if (wo.tech && ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'].includes(wo.status)) {
        if (!techWOMap[wo.tech.id]) techWOMap[wo.tech.id] = [];
        techWOMap[wo.tech.id].push(wo);
      }
    }

    for (const [techId, wos] of Object.entries(techWOMap)) {
      if (wos.length === 0) continue;

      const route = await prisma.route.create({
        data: {
          companyId: company.id,
          technicianId: techId,
          date: today,
          optimized: Math.random() < 0.7,
          totalDistanceMeters: randomInt(15000, 80000),
          totalDurationSeconds: randomInt(1800, 7200),
          geometryJson: JSON.stringify({
            type: 'LineString',
            coordinates: Array.from({ length: wos.length + 1 }, () => {
              const p = randomOffset(center, 15);
              return [p.lng, p.lat];
            }),
          }),
        },
      });
      totalRoutes++;

      let arrivalTime = new Date(today.getTime() + 8 * 60 * 60 * 1000);
      for (let si = 0; si < wos.length; si++) {
        await prisma.routeStop.create({
          data: {
            companyId: company.id,
            routeId: route.id,
            workOrderId: wos[si].id,
            sortOrder: si,
            estimatedArrival: arrivalTime,
            estimatedDeparture: addHours(arrivalTime, wos[si].estimatedMinutes / 60),
            distanceFromPrevMeters: si === 0 ? 0 : randomInt(2000, 15000),
            durationFromPrevSeconds: si === 0 ? 0 : randomInt(300, 1800),
          },
        });
        arrivalTime = addHours(arrivalTime, (wos[si].estimatedMinutes + 30) / 60);
        totalStops++;
      }
    }

    // ---- Job Photos (for 60% of completed work orders) ----
    const completedWOs = workOrders.filter(
      (wo) => ['COMPLETED', 'INVOICED', 'PAID'].includes(wo.status),
    );

    for (const wo of completedWOs) {
      if (Math.random() < 0.4) continue; // skip 40%

      const numPhotos = randomInt(1, 4);
      const captions = [
        'Before - initial condition',
        'During - work in progress',
        'After - completed repair',
        'Equipment nameplate',
        'Parts replaced',
      ];

      const photos = [];
      for (let p = 0; p < numPhotos; p++) {
        photos.push({
          companyId: company.id,
          workOrderId: wo.id,
          technicianId: wo.tech?.id || null,
          url: `https://storage.example.com/photos/${wo.id}/${p + 1}.jpg`,
          thumbnailUrl: `https://storage.example.com/photos/${wo.id}/${p + 1}_thumb.jpg`,
          caption: captions[p % captions.length],
          mimeType: 'image/jpeg',
          sizeBytes: randomInt(200000, 4000000),
          latitude: Number(wo.latitude),
          longitude: Number(wo.longitude),
        });
      }
      await prisma.jobPhoto.createMany({ data: photos });
      totalPhotos += photos.length;
    }

    // ---- Notifications (for first 15 work orders per company) ----
    const notifTypes = [
      { type: 'WORK_ORDER_CREATED', requiredStatuses: STATUSES },
      { type: 'TECHNICIAN_DISPATCHED', requiredStatuses: ['ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID'] },
      { type: 'TECHNICIAN_EN_ROUTE', requiredStatuses: ['EN_ROUTE', 'ON_SITE', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID'] },
      { type: 'TECHNICIAN_ARRIVED', requiredStatuses: ['ON_SITE', 'IN_PROGRESS', 'COMPLETED', 'INVOICED', 'PAID'] },
      { type: 'JOB_COMPLETED', requiredStatuses: ['COMPLETED', 'INVOICED', 'PAID'] },
      { type: 'INVOICE_SENT', requiredStatuses: ['INVOICED', 'PAID'] },
    ];

    for (const wo of workOrders.slice(0, 15)) {
      for (const nt of notifTypes) {
        if (!nt.requiredStatuses.includes(wo.status)) continue;

        await prisma.notification.create({
          data: {
            companyId: company.id,
            workOrderId: wo.id,
            recipientType: 'CUSTOMER',
            recipientId: wo.customer.id,
            channel: randomItem(['SMS', 'EMAIL']) as any,
            type: nt.type as any,
            subject: nt.type === 'INVOICE_SENT' ? `Invoice for ${wo.referenceNumber}` : undefined,
            body: `${nt.type.replace(/_/g, ' ').toLowerCase()} for work order ${wo.referenceNumber}`,
            sentAt: daysAgo(randomInt(0, 7)),
          },
        });
        totalNotifications++;
      }
    }

    // ---- Audit Logs (for first 12 work orders per company) ----
    for (const wo of workOrders.slice(0, 12)) {
      await prisma.auditLog.create({
        data: {
          companyId: company.id,
          userId: admin.id,
          action: 'WORK_ORDER_CREATED',
          entityType: 'WorkOrder',
          entityId: wo.id,
          metadata: { referenceNumber: wo.referenceNumber, serviceType: wo.serviceType },
        },
      });
      totalAuditLogs++;

      if (wo.tech) {
        await prisma.auditLog.create({
          data: {
            companyId: company.id,
            userId: admin.id,
            action: 'TECHNICIAN_ASSIGNED',
            entityType: 'WorkOrder',
            entityId: wo.id,
            metadata: { technicianId: wo.tech.id },
          },
        });
        totalAuditLogs++;
      }
    }

    console.log(`  ${def.techCount} technicians, ${def.custCount} customers, ${def.woCount} work orders`);
  }

  // ============================================================
  // Summary
  // ============================================================
  console.log('');
  console.log('=== Seed Complete ===');
  console.log(`Companies:          ${COMPANY_DEFS.length}`);
  console.log(`Users:              ${totalUsers}`);
  console.log(`Technicians:        ${totalTechs}`);
  console.log(`Customers:          ${totalCustomers}`);
  console.log(`Work Orders:        ${totalWOs}`);
  console.log(`Status History:     ${totalStatusHistory}`);
  console.log(`Line Items:         ${totalLineItems}`);
  console.log(`Invoices:           ${totalInvoices}`);
  console.log(`Routes:             ${totalRoutes} (${totalStops} stops)`);
  console.log(`GPS Positions:      ${totalPositions}`);
  console.log(`Job Photos:         ${totalPhotos}`);
  console.log(`Notifications:      ${totalNotifications}`);
  console.log(`Audit Logs:         ${totalAuditLogs}`);
  console.log('');
  console.log('Demo credentials (all companies):');
  console.log('  Password: Password123!');
  for (const def of COMPANY_DEFS) {
    console.log(`  ${def.name}: ${def.email}`);
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
