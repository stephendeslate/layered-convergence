// [TRACED:FD-026] GPS event recording endpoint
import { Controller, Post, Body, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { RouteService } from "./route.service";

@Controller("routes")
@UseGuards(AuthGuard("jwt"))
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post()
  create(@Body() body: { technicianId: string; companyId: string; name: string; scheduledAt: string }) {
    return this.routeService.createRoute(body.technicianId, body.companyId, body.name, new Date(body.scheduledAt));
  }

  @Post(":id/transition")
  transition(@Param("id") id: string, @Body() body: { status: string }) {
    return this.routeService.transitionRoute(id, body.status);
  }

  @Post("gps")
  recordGps(@Body() body: { technicianId: string; latitude: number; longitude: number; accuracy?: number }) {
    return this.routeService.recordGpsEvent(body.technicianId, body.latitude, body.longitude, body.accuracy);
  }
}
