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
const _authmodule = require("./auth/auth.module");
const _tenantsmodule = require("./tenants/tenants.module");
const _dashboardsmodule = require("./dashboards/dashboards.module");
const _widgetsmodule = require("./widgets/widgets.module");
const _datasourcesmodule = require("./data-sources/data-sources.module");
const _datasourceconfigsmodule = require("./data-source-configs/data-source-configs.module");
const _syncrunsmodule = require("./sync-runs/sync-runs.module");
const _datapointsmodule = require("./data-points/data-points.module");
const _embedconfigsmodule = require("./embed-configs/embed-configs.module");
const _querycachemodule = require("./query-cache/query-cache.module");
const _deadlettereventsmodule = require("./dead-letter-events/dead-letter-events.module");
const _pipelinesmodule = require("./pipelines/pipelines.module");
const _jwtauthguard = require("./common/guards/jwt-auth.guard");
const _appcontroller = require("./app.controller");
const _appservice = require("./app.service");
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
            _authmodule.AuthModule,
            _tenantsmodule.TenantsModule,
            _dashboardsmodule.DashboardsModule,
            _widgetsmodule.WidgetsModule,
            _datasourcesmodule.DataSourcesModule,
            _datasourceconfigsmodule.DataSourceConfigsModule,
            _syncrunsmodule.SyncRunsModule,
            _datapointsmodule.DataPointsModule,
            _embedconfigsmodule.EmbedConfigsModule,
            _querycachemodule.QueryCacheModule,
            _deadlettereventsmodule.DeadLetterEventsModule,
            _pipelinesmodule.PipelinesModule
        ],
        controllers: [
            _appcontroller.AppController
        ],
        providers: [
            _appservice.AppService,
            {
                provide: _core.APP_GUARD,
                useClass: _jwtauthguard.JwtAuthGuard
            }
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map