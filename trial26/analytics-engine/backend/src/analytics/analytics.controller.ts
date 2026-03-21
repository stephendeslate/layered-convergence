// [TRACED:AE-022] Pipeline creation endpoint
// [TRACED:AE-023] Pipeline transition endpoint
import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
@UseGuards(AuthGuard("jwt"))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("pipelines")
  createPipeline(@Body() body: { tenantId: string; name: string; config: Record<string, unknown> }) {
    return this.analyticsService.createPipeline(body.tenantId, body.name, body.config);
  }

  @Post("pipelines/:id/transition")
  transitionPipeline(@Param("id") id: string, @Body() body: { status: string }) {
    return this.analyticsService.transitionPipeline(id, body.status);
  }

  @Get("dashboards/:tenantId")
  getDashboards(@Param("tenantId") tenantId: string) {
    return this.analyticsService.getDashboards(tenantId);
  }

  @Post("dashboards")
  createDashboard(@Body() body: { tenantId: string; name: string; createdBy: string }) {
    return this.analyticsService.createDashboard(body.tenantId, body.name, body.createdBy);
  }

  @Get("data-sources/:tenantId")
  getDataSources(@Param("tenantId") tenantId: string) {
    return this.analyticsService.getDataSources(tenantId);
  }

  @Post("data-sources")
  createDataSource(@Body() body: { tenantId: string; name: string; type: string; connectionUri: string }) {
    return this.analyticsService.createDataSource(body.tenantId, body.name, body.type, body.connectionUri);
  }
}
