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
(0, vitest_1.describe)('Error Handling / PrismaExceptionFilter (integration)', () => {
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
        const company = await prisma.company.create({ data: { name: 'Error Test Co' } });
        companyId = company.id;
    });
    (0, vitest_1.describe)('P2002 Unique constraint -> 409 Conflict', () => {
        (0, vitest_1.it)('should return 409 when creating technician with duplicate email', async () => {
            await (0, supertest_1.default)(app.getHttpServer())
                .post('/technicians')
                .set('x-company-id', companyId)
                .send({
                companyId,
                name: 'Tech 1',
                email: 'duplicate@example.com',
                skills: ['plumbing'],
            })
                .expect(201);
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/technicians')
                .set('x-company-id', companyId)
                .send({
                companyId,
                name: 'Tech 2',
                email: 'duplicate@example.com',
                skills: ['electric'],
            })
                .expect(409);
            (0, vitest_1.expect)(res.body.statusCode).toBe(409);
            (0, vitest_1.expect)(res.body.error).toBe('P2002');
        });
    });
    (0, vitest_1.describe)('P2025 Record not found -> 404', () => {
        (0, vitest_1.it)('should return 404 when fetching non-existent work order', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get(`/work-orders/${fakeId}`)
                .set('x-company-id', companyId)
                .expect(404);
            (0, vitest_1.expect)(res.body.statusCode).toBe(404);
        });
        (0, vitest_1.it)('should return 404 when transitioning non-existent work order', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            await (0, supertest_1.default)(app.getHttpServer())
                .patch(`/work-orders/${fakeId}/assign`)
                .set('x-company-id', companyId)
                .send({ technicianId: '00000000-0000-0000-0000-000000000001' })
                .expect(404);
        });
        (0, vitest_1.it)('should return 404 when fetching non-existent company', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            await (0, supertest_1.default)(app.getHttpServer())
                .get(`/companies/${fakeId}`)
                .expect(404);
        });
        (0, vitest_1.it)('should return 404 when deleting non-existent company', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            await (0, supertest_1.default)(app.getHttpServer())
                .delete(`/companies/${fakeId}`)
                .expect(404);
        });
    });
    (0, vitest_1.describe)('BadRequestException -> 400', () => {
        (0, vitest_1.it)('should return 400 for invalid state transition', async () => {
            const customer = await prisma.customer.create({
                data: { companyId, name: 'Cust', address: '1 Main' },
            });
            const wo = await prisma.workOrder.create({
                data: { companyId, customerId: customer.id, description: 'Bad trans' },
            });
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .patch(`/work-orders/${wo.id}/transition`)
                .set('x-company-id', companyId)
                .send({ status: 'COMPLETED' })
                .expect(400);
            (0, vitest_1.expect)(res.body.message).toContain('Invalid transition');
        });
        (0, vitest_1.it)('should return 400 for auto-assign on non-UNASSIGNED work order', async () => {
            const customer = await prisma.customer.create({
                data: { companyId, name: 'Cust 2', address: '2 Main' },
            });
            const tech = await prisma.technician.create({
                data: { companyId, name: 'Tech', email: 'tech-auto@ex.com', skills: ['a'] },
            });
            const wo = await prisma.workOrder.create({
                data: {
                    companyId,
                    customerId: customer.id,
                    technicianId: tech.id,
                    description: 'Already assigned',
                    status: 'ASSIGNED',
                },
            });
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post(`/work-orders/${wo.id}/auto-assign`)
                .set('x-company-id', companyId)
                .expect(400);
            (0, vitest_1.expect)(res.body.message).toContain('UNASSIGNED');
        });
    });
    (0, vitest_1.describe)('ValidationPipe -> 400', () => {
        (0, vitest_1.it)('should return 400 for missing required fields', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/work-orders')
                .set('x-company-id', companyId)
                .send({})
                .expect(400);
            (0, vitest_1.expect)(res.body.statusCode).toBe(400);
        });
        (0, vitest_1.it)('should return 400 for non-whitelisted properties', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/companies')
                .send({ name: 'Test Co', hackerField: 'bad' })
                .expect(400);
            (0, vitest_1.expect)(res.body.statusCode).toBe(400);
        });
        (0, vitest_1.it)('should return 400 for invalid UUID format', async () => {
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .post('/work-orders')
                .set('x-company-id', companyId)
                .send({
                companyId: 'not-a-uuid',
                customerId: 'also-not-uuid',
                description: 'test',
            })
                .expect(400);
            (0, vitest_1.expect)(res.body.statusCode).toBe(400);
        });
    });
    (0, vitest_1.describe)('HttpException passthrough', () => {
        (0, vitest_1.it)('should pass through NotFoundException as 404', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            const res = await (0, supertest_1.default)(app.getHttpServer())
                .get(`/technicians/${fakeId}`)
                .set('x-company-id', companyId)
                .expect(404);
            (0, vitest_1.expect)(res.body.statusCode).toBe(404);
        });
    });
});
//# sourceMappingURL=error-handling.integration-spec.js.map