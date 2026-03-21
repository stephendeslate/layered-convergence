import { v4 as uuidv4 } from 'uuid';

let counter = 0;
function nextId(): string {
  return `test-id-${++counter}`;
}

export function resetFactoryCounter() {
  counter = 0;
}

export function buildCompany(overrides: Record<string, any> = {}) {
  const id = nextId();
  return {
    id,
    name: `Test Company ${id}`,
    slug: `test-company-${id}`,
    email: `admin@test-${id}.com`,
    phone: '(555) 000-0000',
    logoUrl: null,
    website: null,
    taxRate: 0.0875,
    serviceAreaPolygon: null,
    timezone: 'America/Denver',
    settings: {},
    stripeCustomerId: null,
    stripeAccountId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildUser(overrides: Record<string, any> = {}) {
  const id = nextId();
  return {
    id,
    companyId: 'company-1',
    email: `user-${id}@test.com`,
    passwordHash: '$2b$12$fake-hash',
    firstName: 'Test',
    lastName: `User ${id}`,
    role: 'DISPATCHER',
    phone: null,
    avatarUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildTechnician(overrides: Record<string, any> = {}) {
  const id = nextId();
  return {
    id,
    companyId: 'company-1',
    userId: `user-${id}`,
    status: 'AVAILABLE',
    skills: ['HVAC_REPAIR'],
    maxJobsPerDay: 8,
    currentLatitude: 39.7392,
    currentLongitude: -104.9903,
    lastPositionAt: new Date(),
    vehicleInfo: `Van #${id}`,
    color: '#3B82F6',
    simulationMode: false,
    schedule: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildCustomer(overrides: Record<string, any> = {}) {
  const id = nextId();
  return {
    id,
    companyId: 'company-1',
    firstName: `Customer`,
    lastName: `${id}`,
    email: `customer-${id}@test.com`,
    phone: '(555) 000-1111',
    address: '123 Test St',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    latitude: 39.7392,
    longitude: -104.9903,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildWorkOrder(overrides: Record<string, any> = {}) {
  const id = nextId();
  const now = new Date();
  const scheduledStart = new Date(now);
  scheduledStart.setHours(scheduledStart.getHours() + 1);
  const scheduledEnd = new Date(scheduledStart);
  scheduledEnd.setHours(scheduledEnd.getHours() + 1);

  return {
    id,
    companyId: 'company-1',
    customerId: 'customer-1',
    technicianId: null,
    referenceNumber: `WO-${String(counter).padStart(5, '0')}`,
    status: 'UNASSIGNED',
    priority: 'NORMAL',
    serviceType: 'HVAC_REPAIR',
    description: 'Test work order',
    notes: null,
    address: '123 Test St',
    city: 'Denver',
    state: 'CO',
    zipCode: '80202',
    latitude: 39.7392,
    longitude: -104.9903,
    scheduledStart,
    scheduledEnd,
    estimatedMinutes: 60,
    actualStart: null,
    actualEnd: null,
    trackingToken: uuidv4(),
    trackingExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function buildRoute(overrides: Record<string, any> = {}) {
  const id = nextId();
  return {
    id,
    companyId: 'company-1',
    technicianId: 'tech-1',
    date: new Date(),
    optimized: false,
    totalDistanceMeters: null,
    totalDurationSeconds: null,
    geometryJson: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildInvoice(overrides: Record<string, any> = {}) {
  const id = nextId();
  return {
    id,
    companyId: 'company-1',
    customerId: 'customer-1',
    workOrderId: 'wo-1',
    invoiceNumber: `INV-${String(counter).padStart(5, '0')}`,
    status: 'DRAFT',
    subtotal: 130.50,
    taxAmount: 11.42,
    totalAmount: 141.92,
    stripeInvoiceId: null,
    stripePaymentUrl: null,
    paidAt: null,
    sentAt: null,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildJwtPayload(overrides: Record<string, any> = {}) {
  return {
    sub: 'user-1',
    companyId: 'company-1',
    role: 'ADMIN',
    email: 'admin@test.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400,
    ...overrides,
  };
}
