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
const common_2 = require("@nestjs/common");
const prisma_module_js_1 = require("./prisma/prisma.module.js");
const tenant_module_js_1 = require("./tenant/tenant.module.js");
const dashboard_module_js_1 = require("./dashboard/dashboard.module.js");
const widget_module_js_1 = require("./widget/widget.module.js");
const datasource_module_js_1 = require("./datasource/datasource.module.js");
const pipeline_module_js_1 = require("./pipeline/pipeline.module.js");
const datapoint_module_js_1 = require("./datapoint/datapoint.module.js");
const webhook_ingest_module_js_1 = require("./webhook-ingest/webhook-ingest.module.js");
const embed_module_js_1 = require("./embed/embed.module.js");
const sse_module_js_1 = require("./sse/sse.module.js");
const query_cache_module_js_1 = require("./query-cache/query-cache.module.js");
const aggregation_module_js_1 = require("./aggregation/aggregation.module.js");
const prisma_exception_filter_js_1 = require("./common/filters/prisma-exception.filter.js");
const tenant_context_middleware_js_1 = require("./common/middleware/tenant-context.middleware.js");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(tenant_context_middleware_js_1.TenantContextMiddleware)
            .exclude('tenants/(.*)', 'tenants', 'ingest/(.*)', 'embed/(.*)', 'query-cache/(.*)', 'query-cache', 'sse/(.*)')
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_js_1.PrismaModule,
            tenant_module_js_1.TenantModule,
            dashboard_module_js_1.DashboardModule,
            widget_module_js_1.WidgetModule,
            datasource_module_js_1.DataSourceModule,
            pipeline_module_js_1.PipelineModule,
            datapoint_module_js_1.DataPointModule,
            webhook_ingest_module_js_1.WebhookIngestModule,
            embed_module_js_1.EmbedModule,
            sse_module_js_1.SseModule,
            query_cache_module_js_1.QueryCacheModule,
            aggregation_module_js_1.AggregationModule,
        ],
        providers: [
            {
                provide: core_1.APP_PIPE,
                useValue: new common_2.ValidationPipe({
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