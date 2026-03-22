import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Header,
} from '@nestjs/common';
import { ServiceAreaService } from './service-area.service';
import { CreateServiceAreaDto } from './dto/create-service-area.dto';
import { UpdateServiceAreaDto } from './dto/update-service-area.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// TRACED: FD-SERVICE-AREA-CRUD
@Controller('service-areas')
@UseGuards(JwtAuthGuard)
export class ServiceAreaController {
  constructor(private readonly serviceAreaService: ServiceAreaService) {}

  @Post()
  create(
    @Body() dto: CreateServiceAreaDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.serviceAreaService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=60')
  findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.serviceAreaService.findAll(
      req.user.tenantId,
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.serviceAreaService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceAreaDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.serviceAreaService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.serviceAreaService.remove(id, req.user.tenantId);
  }
}
