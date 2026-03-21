"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const supertest_1 = __importDefault(require("supertest"));
const app_module_js_1 = require("../app.module.js");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
(0, vitest_1.describe)('Company Isolation / Tenant Context (integration)', () => {
    let app;
    let prisma;
    let companyA;
    let companyB;
    let customerA;
    let customerB;
    let techA;
    let techB;
    (0, vitest_1.beforeAll)(async () => {
        const moduleRef = await testing_1.Test.createTestingModule({
            imports: [app_module_js_1.AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
        await app.init();
        prisma = app.get(prisma_service_js_1.PrismaService);
    });
    (0, vitest_1.afterAll)(async () => {
        await app.close();
    });
    (0, vitest_1.beforeEach)(async () => {
        await prisma.$executeRaw `TRUNCATE "Invoice", "WorkOrderStatusHistory", "WorkOrder", "Route", "Technician", "Customer", "Company" CASCADE`;
        const a = await prisma.company.create({ data: { name: 'Company A' } });
        companyA = a.id;
        const b = await prisma.company.create({ data: { name: 'Company B' } });
        companyB = b.id;
        const cA = await prisma.customer.create({
            data: { companyId: companyA, name: 'Cust A', address: '1 A St' },
        });
        customerA = cA.id;
        const cB = await prisma.customer.create({
            data: { companyId: companyB, name: 'Cust B', address: '1 B St' },
        });
        customerB = cB.id;
        const tA = await prisma.technician.create({
            data: {
                companyId: companyA,
                name: 'Tech A',
                email: 'tech-a@a.com',
                skills: ['plumbing'],
            },
        });
        techA = tA.id;
        const tB = await prisma.technician.create({
            data: {
                companyId: companyB,
                name: 'Tech B',
                email: 'tech-b@b.com',
                skills: ['electric'],
            },
        });
        techB = tB.id;
    });
    (0, vitest_1.it)('should only return work orders for the requesting company', async () => {
        await prisma.workOrder.create({
            data: { companyId: companyA, customerId: customerA, description: 'WO for A' },
        });
        await prisma.workOrder.create({
            data: { companyId: companyB, customerId: customerB, description: 'WO for B' },
        });
        const resA = await (0, supertest_1.default)(app.getHttpServer())
            .get('/work-orders')
            .set('x-company-id', companyA)
            .expect(200);
        (0, vitest_1.expect)(resA.body).toHaveLength(1);
        (0, vitest_1.expect)(resA.body[0].description).toBe('WO for A');
        const resB = await (0, supertest_1.default)(app.getHttpServer())
            .get('/work-orders')
            .set('x-company-id', companyB)
            .expect(200);
        (0, vitest_1.expect)(resB.body).toHaveLength(1);
        (0, vitest_1.expect)(resB.body[0].description).toBe('WO for B');
    });
    (0, vitest_1.it)('should not allow company A to view company B work order by id', async () => {
        const wo = await prisma.workOrder.create({
            data: { companyId: companyB, customerId: customerB, description: 'Secret WO' },
        });
        await (0, supertest_1.default)(app.getHttpServer())
            .get(`/work-orders/${wo.id}`)
            .set('x-company-id', companyA)
            .expect(404);
    });
    (0, vitest_1.it)('should not allow company A to transition company B work order', async () => {
        const wo = await prisma.workOrder.create({
            data: { companyId: companyB, customerId: customerB, description: 'Cross tenant' },
        });
        await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/assign`)
            .set('x-company-id', companyA)
            .send({ technicianId: techA })
            .expect(404);
    });
    (0, vitest_1.it)('should only return technicians for the requesting company', async () => {
        const resA = await (0, supertest_1.default)(app.getHttpServer())
            .get('/technicians')
            .set('x-company-id', companyA)
            .expect(200);
        (0, vitest_1.expect)(resA.body).toHaveLength(1);
        (0, vitest_1.expect)(resA.body[0].name).toBe('Tech A');
    });
    (0, vitest_1.it)('should not allow company A to view company B technician', async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .get(`/technicians/${techB}`)
            .set('x-company-id', companyA)
            .expect(404);
    });
    (0, vitest_1.it)('should only return customers for the requesting company', async () => {
        const resB = await (0, supertest_1.default)(app.getHttpServer())
            .get('/customers')
            .set('x-company-id', companyB)
            .expect(200);
        (0, vitest_1.expect)(resB.body).toHaveLength(1);
        (0, vitest_1.expect)(resB.body[0].name).toBe('Cust B');
    });
    (0, vitest_1.it)('should not allow company B to view company A customer', async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .get(`/customers/${customerA}`)
            .set('x-company-id', companyB)
            .expect(404);
    });
    (0, vitest_1.it)('should allow company routes without x-company-id header', async () => {
        await (0, supertest_1.default)(app.getHttpServer())
            .get('/companies')
            .expect(200);
    });
    (0, vitest_1.it)('should create company without x-company-id header', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/companies')
            .send({ name: 'New Company' })
            .expect(201);
        (0, vitest_1.expect)(res.body.name).toBe('New Company');
    });
    (0, vitest_1.it)('should isolate auto-assign to same company technicians only', async () => {
        await prisma.technician.update({
            where: { id: techA },
            data: { currentLat: 40.71, currentLng: -74.0 },
        });
        await prisma.technician.update({
            where: { id: techB },
            data: { currentLat: 40.72, currentLng: -74.01 },
        });
        const customerWithGeo = await prisma.customer.create({
            data: {
                companyId: companyA,
                name: 'Geo Cust',
                address: '789 St',
                lat: 40.71,
                lng: -74.0,
            },
        });
        const wo = await prisma.workOrder.create({
            data: { companyId: companyA, customerId: customerWithGeo.id, description: 'Isolated auto' },
        });
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/work-orders/${wo.id}/auto-assign`)
            .set('x-company-id', companyA)
            .expect(201);
        (0, vitest_1.expect)(res.body.technicianId).toBe(techA);
    });
});
//# sourceMappingURL=company-isolation.integration-spec.js.map