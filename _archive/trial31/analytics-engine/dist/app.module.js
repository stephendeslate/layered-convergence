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
const _prismamodule = require("./prisma/prisma.module");
const _redismodule = require("./redis/redis.module");
const _bullmqmodule = require("./bullmq/bullmq.module");
const _tenantmodule = require("./tenant/tenant.module");
const _dashboardmodule = require("./dashboard/dashboard.module");
const _widgetmodule = require("./widget/widget.module");
const _datasourcemodule = require("./data-source/data-source.module");
const _datasourceconfigmodule = require("./data-source-config/data-source-config.module");
const _syncrunmodule = require("./sync-run/sync-run.module");
const _datapointmodule = require("./data-point/data-point.module");
const _deadlettereventmodule = require("./dead-letter-event/dead-letter-event.module");
const _embedmodule = require("./embed/embed.module");
const _analyticsmodule = require("./analytics/analytics.module");
const _ingestionmodule = require("./ingestion/ingestion.module");
const _authmodule = require("./auth/auth.module");
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
            _redismodule.RedisModule,
            _bullmqmodule.BullMqModule,
            _tenantmodule.TenantModule,
            _dashboardmodule.DashboardModule,
            _widgetmodule.WidgetModule,
            _datasourcemodule.DataSourceModule,
            _datasourceconfigmodule.DataSourceConfigModule,
            _syncrunmodule.SyncRunModule,
            _datapointmodule.DataPointModule,
            _deadlettereventmodule.DeadLetterEventModule,
            _embedmodule.EmbedModule,
            _analyticsmodule.AnalyticsModule,
            _ingestionmodule.IngestionModule,
            _authmodule.AuthModule
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map