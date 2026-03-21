// [TRACED:AE-008] Analytics API endpoints for dashboards and pipelines
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
@UseGuards(AuthGuard("jwt"))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("dashboards")
  getDashboards(@Request() req: { user: { tenantId: string } }) {
    return this.analyticsService.getDashboards(req.user.tenantId);
  }

  @Post("pipelines")
  createPipeline(
    @Request() req: { user: { tenantId: string } },
    @Body() body: { name: string; config: Record<string, unknown> },
  ) {
    return this.analyticsService.createPipeline(req.user.tenantId, body);
  }

  @Post("pipelines/:id/transition")
  transitionPipeline(
    @Param("id") id: string,
    @Body() body: { status: string },
  ) {
    return this.analyticsService.transitionPipeline(id, body.status);
  }
}
