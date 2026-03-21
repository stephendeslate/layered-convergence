"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _core = require("@nestjs/core");
const _prismamodule = require("./prisma/prisma.module");
const _companiesmodule = require("./companies/companies.module");
const _techniciansmodule = require("./technicians/technicians.module");
const _customersmodule = require("./customers/customers.module");
const _workordersmodule = require("./work-orders/work-orders.module");
const _routesmodule = require("./routes/routes.module");
const _invoicesmodule = require("./invoices/invoices.module");
const _gpsmodule = require("./gps/gps.module");
const _authmodule = require("./auth/auth.module");
const _prismaexceptionfilter = require("./common/filters/prisma-exception.filter");
const _authguard = require("./common/guards/auth.guard");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _config.ConfigModule.forRoot({
                isGlobal: true
            }),
            _prismamodule.PrismaModule,
            _companiesmodule.CompaniesModule,
            _techniciansmodule.TechniciansModule,
            _customersmodule.CustomersModule,
            _workordersmodule.WorkOrdersModule,
            _routesmodule.RoutesModule,
            _invoicesmodule.InvoicesModule,
            _gpsmodule.GpsModule,
            _authmodule.AuthModule
        ],
        providers: [
            {
                provide: _core.APP_FILTER,
                useClass: _prismaexceptionfilter.PrismaExceptionFilter
            },
            {
                provide: _core.APP_GUARD,
                useClass: _authguard.AuthGuard
            }
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map