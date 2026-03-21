"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const supertest_1 = __importDefault(require("supertest"));
const app_module_js_1 = require("../../app.module.js");
const prisma_service_js_1 = require("../../prisma/prisma.service.js");
(0, vitest_1.describe)('Company Context Auth Flow (integration)', () => {
    let app;
    let prisma;
    let companyId;
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
        const company = await prisma.company.create({ data: { name: 'Auth Test Co' } });
        companyId = company.id;
    });
    (0, vitest_1.describe)('x-company-id header enforcement', () => {
        (0, vitest_1.it)('should return 400 when x-company-id header is missing on protected routes', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/work-orders')
                .expect(400);
            (0, vitest_1.expect)(res.body.message).toContain('x-company-id');
        });
        (0, vitest_1.it)('should return 400 when x-company-id header is missing for technicians', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/technicians')
                .expect(400);
        });
        (0, vitest_1.it)('should return 400 when x-company-id header is missing for customers', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/customers')
                .expect(400);
        });
        (0, vitest_1.it)('should accept request with valid x-company-id header', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .get('/work-orders')
                .set('x-company-id', companyId)
                .expect(200);
        });
    });
    (0, vitest_1.describe)('company routes excluded from middleware', () => {
        (0, vitest_1.it)('should allow GET /companies without x-company-id', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/companies')
                .expect(200);
            (0, vitest_1.expect)(Array.isArray(res.body)).toBe(true);
        });
        (0, vitest_1.it)('should allow POST /companies without x-company-id', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/companies')
                .send({ name: 'No Header Co' })
                .expect(201);
            (0, vitest_1.expect)(res.body.name).toBe('No Header Co');
        });
        (0, vitest_1.it)('should allow GET /companies/:id without x-company-id', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .get(`/companies/${companyId}`)
                .expect(200);
        });
        (0, vitest_1.it)('should allow PATCH /companies/:id without x-company-id', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .patch(`/companies/${companyId}`)
                .send({ name: 'Updated Name' })
                .expect(200);
            (0, vitest_1.expect)(res.body.name).toBe('Updated Name');
        });
        (0, vitest_1.it)('should allow DELETE /companies/:id without x-company-id', async () => {
            const toDelete = await prisma.company.create({ data: { name: 'Delete Me' } });
            await (0, supertest_1.default)(app.getHttpServer())
                .delete(`/companies/${toDelete.id}`)
                .expect(200);
        });
    });
    (0, vitest_1.describe)('company context propagation', () => {
        (0, vitest_1.it)('should scope technician creation to the provided company', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/technicians')
                .set('x-company-id', companyId)
                .send({
                companyId,
                name: 'Scoped Tech',
                email: 'scoped@example.com',
                skills: ['plumbing'],
            })
                .expect(201);
            (0, vitest_1.expect)(res.body.companyId).toBe(companyId);
            const list = await (0, supertest_1.default)(app.getHttpServer())
                .get('/technicians')
                .set('x-company-id', companyId)
                .expect(200);
            (0, vitest_1.expect)(list.body).toHaveLength(1);
        });
        (0, vitest_1.it)('should scope customer creation to the provided company', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/customers')
                .set('x-company-id', companyId)
                .send({
                companyId,
                name: 'Scoped Customer',
                address: '100 Main St',
            })
                .expect(201);
            (0, vitest_1.expect)(res.body.companyId).toBe(companyId);
        });
        (0, vitest_1.it)('should scope work order listing to company context', async () => {
            const otherCompany = await prisma.company.create({ data: { name: 'Other Co' } });
            const otherCustomer = await prisma.customer.create({
                data: { companyId: otherCompany.id, name: 'Other Cust', address: '2 St' },
            });
            const myCustomer = await prisma.customer.create({
                data: { companyId, name: 'My Cust', address: '1 St' },
            });
            await prisma.workOrder.create({
                data: { companyId, customerId: myCustomer.id, description: 'Mine' },
            });
            await prisma.workOrder.create({
                data: { companyId: otherCompany.id, customerId: otherCustomer.id, description: 'Theirs' },
            });
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get('/work-orders')
                .set('x-company-id', companyId)
                .expect(200);
            (0, vitest_1.expect)(res.body).toHaveLength(1);
            (0, vitest_1.expect)(res.body[0].description).toBe('Mine');
        });
    });
    (0, vitest_1.describe)('end-to-end auth flow', () => {
        (0, vitest_1.it)('should support full workflow: create company, create resources, query scoped data', async () => {
            const compRes = await (0, supertest_1.default)(app.getHttpServer())
                .post('/companies')
                .send({ name: 'E2E Company' })
                .expect(201);
            const cId = compRes.body.id;
            const techRes = await (0, supertest_1.default)(app.getHttpServer())
                .post('/technicians')
                .set('x-company-id', cId)
                .send({
                companyId: cId,
                name: 'E2E Tech',
                email: 'e2e@example.com',
                skills: ['hvac'],
            })
                .expect(201);
            const custRes = await (0, supertest_1.default)(app.getHttpServer())
                .post('/customers')
                .set('x-company-id', cId)
                .send({
                companyId: cId,
                name: 'E2E Customer',
                address: '123 E2E St',
            })
                .expect(201);
            const woRes = await (0, supertest_1.default)(app.getHttpServer())
                .post('/work-orders')
                .set('x-company-id', cId)
                .send({
                companyId: cId,
                customerId: custRes.body.id,
                technicianId: techRes.body.id,
                description: 'E2E work order',
            })
                .expect(201);
            (0, vitest_1.expect)(woRes.body.status).toBe('ASSIGNED');
            const woList = await (0, supertest_1.default)(app.getHttpServer())
                .get('/work-orders')
                .set('x-company-id', cId)
                .expect(200);
            (0, vitest_1.expect)(woList.body).toHaveLength(1);
            (0, vitest_1.expect)(woList.body[0].id).toBe(woRes.body.id);
        });
    });
});
//# sourceMappingURL=company-context-auth.integration-spec.js.map