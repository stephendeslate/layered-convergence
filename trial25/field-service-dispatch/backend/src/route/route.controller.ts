import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RouteService } from './route.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  async findAll(@Request() req: { user: { id: string; companyId: string } }) {
    return this.routeService.findAll(req.user.id, req.user.companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.routeService.findOne(id, req.user.id, req.user.companyId);
  }

  @Post()
  async create(
    @Body() body: { name: string; scheduledAt: Date; technicianId: string },
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.routeService.create(body, req.user.id, req.user.companyId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.routeService.updateStatus(
      id,
      body.status as never,
      req.user.id,
      req.user.companyId,
    );
  }
}
