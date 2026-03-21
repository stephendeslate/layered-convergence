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
(0, vitest_1.describe)('WorkOrder State Machine (integration)', () => {
    let app;
    let prisma;
    let companyId;
    let customerId;
    let technicianId;
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
        const company = await prisma.company.create({
            data: { name: 'State Machine Co' },
        });
        companyId = company.id;
        const customer = await prisma.customer.create({
            data: { companyId, name: 'Customer A', address: '123 Main St' },
        });
        customerId = customer.id;
        const technician = await prisma.technician.create({
            data: {
                companyId,
                name: 'Tech A',
                email: 'tech-a@example.com',
                skills: ['plumbing'],
            },
        });
        technicianId = technician.id;
    });
    (0, vitest_1.it)('should create a work order with UNASSIGNED status', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/work-orders')
            .set('x-company-id', companyId)
            .send({
            companyId,
            customerId,
            description: 'Fix sink',
        })
            .expect(201);
        (0, vitest_1.expect)(res.body.status).toBe('UNASSIGNED');
    });
    (0, vitest_1.it)('should create a work order with ASSIGNED status when technicianId provided', async () => {
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post('/work-orders')
            .set('x-company-id', companyId)
            .send({
            companyId,
            customerId,
            technicianId,
            description: 'Fix sink',
        })
            .expect(201);
        (0, vitest_1.expect)(res.body.status).toBe('ASSIGNED');
        (0, vitest_1.expect)(res.body.technicianId).toBe(technicianId);
    });
    (0, vitest_1.it)('should transition UNASSIGNED -> ASSIGNED via assign endpoint', async () => {
        const wo = await prisma.workOrder.create({
            data: { companyId, customerId, description: 'Fix sink' },
        });
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/assign`)
            .set('x-company-id', companyId)
            .send({ technicianId })
            .expect(200);
        (0, vitest_1.expect)(res.body.status).toBe('ASSIGNED');
        (0, vitest_1.expect)(res.body.technicianId).toBe(technicianId);
    });
    (0, vitest_1.it)('should walk through the full happy path: UNASSIGNED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED', async () => {
        const wo = await prisma.workOrder.create({
            data: { companyId, customerId, description: 'Full path test' },
        });
        await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/assign`)
            .set('x-company-id', companyId)
            .send({ technicianId })
            .expect(200);
        await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/en-route`)
            .set('x-company-id', companyId)
            .expect(200);
        await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/on-site`)
            .set('x-company-id', companyId)
            .expect(200);
        await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/start`)
            .set('x-company-id', companyId)
            .expect(200);
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/complete`)
            .set('x-company-id', companyId)
            .expect(200);
        (0, vitest_1.expect)(res.body.status).toBe('COMPLETED');
        (0, vitest_1.expect)(res.body.completedAt).toBeTruthy();
    });
    (0, vitest_1.it)('should reject invalid transitions with 400', async () => {
        const wo = await prisma.workOrder.create({
            data: { companyId, customerId, description: 'Invalid transition' },
        });
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/transition`)
            .set('x-company-id', companyId)
            .send({ status: 'COMPLETED' })
            .expect(400);
        (0, vitest_1.expect)(res.body.message).toContain('Invalid transition');
    });
    (0, vitest_1.it)('should reject UNASSIGNED -> EN_ROUTE', async () => {
        const wo = await prisma.workOrder.create({
            data: { companyId, customerId, description: 'Bad transition' },
        });
        await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/en-route`)
            .set('x-company-id', companyId)
            .expect(400);
    });
    (0, vitest_1.it)('should allow ASSIGNED -> UNASSIGNED (unassign)', async () => {
        const wo = await prisma.workOrder.create({
            data: {
                companyId,
                customerId,
                technicianId,
                description: 'Unassign test',
                status: 'ASSIGNED',
            },
        });
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/unassign`)
            .set('x-company-id', companyId)
            .expect(200);
        (0, vitest_1.expect)(res.body.status).toBe('UNASSIGNED');
        (0, vitest_1.expect)(res.body.technicianId).toBeNull();
    });
    (0, vitest_1.it)('should allow EN_ROUTE -> ASSIGNED (return to assigned)', async () => {
        const wo = await prisma.workOrder.create({
            data: {
                companyId,
                customerId,
                technicianId,
                description: 'Return test',
                status: 'EN_ROUTE',
            },
        });
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/return-to-assigned`)
            .set('x-company-id', companyId)
            .expect(200);
        (0, vitest_1.expect)(res.body.status).toBe('ASSIGNED');
    });
    (0, vitest_1.it)('should record status history on transitions', async () => {
        const wo = await prisma.workOrder.create({
            data: { companyId, customerId, description: 'History test' },
        });
        await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/assign`)
            .set('x-company-id', companyId)
            .send({ technicianId })
            .expect(200);
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .get(`/work-orders/${wo.id}`)
            .set('x-company-id', companyId)
            .expect(200);
        (0, vitest_1.expect)(res.body.statusHistory).toHaveLength(1);
        (0, vitest_1.expect)(res.body.statusHistory[0].fromStatus).toBe('UNASSIGNED');
        (0, vitest_1.expect)(res.body.statusHistory[0].toStatus).toBe('ASSIGNED');
    });
    (0, vitest_1.it)('should reject PAID -> any transition', async () => {
        const wo = await prisma.workOrder.create({
            data: {
                companyId,
                customerId,
                description: 'Paid final test',
                status: 'PAID',
            },
        });
        await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/transition`)
            .set('x-company-id', companyId)
            .send({ status: 'UNASSIGNED' })
            .expect(400);
    });
    (0, vitest_1.it)('should use transition endpoint with explicit status', async () => {
        const wo = await prisma.workOrder.create({
            data: { companyId, customerId, description: 'Transition endpoint' },
        });
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .patch(`/work-orders/${wo.id}/transition`)
            .set('x-company-id', companyId)
            .send({ status: 'ASSIGNED', technicianId })
            .expect(200);
        (0, vitest_1.expect)(res.body.status).toBe('ASSIGNED');
    });
    (0, vitest_1.it)('should auto-assign nearest technician', async () => {
        const customer = await prisma.customer.create({
            data: {
                companyId,
                name: 'Geo Customer',
                address: '456 Oak Ave',
                lat: 40.7128,
                lng: -74.006,
            },
        });
        await prisma.technician.create({
            data: {
                companyId,
                name: 'Far Tech',
                email: 'far@example.com',
                skills: ['electric'],
                currentLat: 41.0,
                currentLng: -75.0,
            },
        });
        const nearTech = await prisma.technician.create({
            data: {
                companyId,
                name: 'Near Tech',
                email: 'near@example.com',
                skills: ['electric'],
                currentLat: 40.72,
                currentLng: -74.01,
            },
        });
        const wo = await prisma.workOrder.create({
            data: { companyId, customerId: customer.id, description: 'Auto assign test' },
        });
        const res = await (0, supertest_1.default)(app.getHttpServer())
            .post(`/work-orders/${wo.id}/auto-assign`)
            .set('x-company-id', companyId)
            .expect(201);
        (0, vitest_1.expect)(res.body.status).toBe('ASSIGNED');
        (0, vitest_1.expect)(res.body.technicianId).toBe(nearTech.id);
    });
});
//# sourceMappingURL=work-order-state-machine.integration-spec.js.map