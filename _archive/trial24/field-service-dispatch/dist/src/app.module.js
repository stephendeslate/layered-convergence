"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_module_js_1 = require("./prisma/prisma.module.js");
const company_module_js_1 = require("./company/company.module.js");
const technician_module_js_1 = require("./technician/technician.module.js");
const customer_module_js_1 = require("./customer/customer.module.js");
const work_order_module_js_1 = require("./work-order/work-order.module.js");
const route_module_js_1 = require("./route/route.module.js");
const invoice_module_js_1 = require("./invoice/invoice.module.js");
const gps_module_js_1 = require("./gps/gps.module.js");
const company_context_middleware_js_1 = require("./common/middleware/company-context.middleware.js");
const prisma_exception_filter_js_1 = require("./common/filters/prisma-exception.filter.js");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(company_context_middleware_js_1.CompanyContextMiddleware)
            .exclude('companies', 'companies/{*path}')
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_js_1.PrismaModule,
            company_module_js_1.CompanyModule,
            technician_module_js_1.TechnicianModule,
            customer_module_js_1.CustomerModule,
            work_order_module_js_1.WorkOrderModule,
            route_module_js_1.RouteModule,
            invoice_module_js_1.InvoiceModule,
            gps_module_js_1.GpsModule,
        ],
        providers: [
            {
                provide: core_1.APP_PIPE,
                useValue: new common_1.ValidationPipe({
                    whitelist: true,
                    forbidNonWhitelisted: true,
                }),
            },
            {
                provide: core_1.APP_FILTER,
                useClass: prisma_exception_filter_js_1.PrismaExceptionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map