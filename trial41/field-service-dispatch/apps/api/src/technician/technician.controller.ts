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
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// TRACED: FD-TECHNICIAN-CRUD
@Controller('technicians')
@UseGuards(JwtAuthGuard)
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  create(
    @Body() dto: CreateTechnicianDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.technicianService.create(dto, req.user.tenantId);
  }

  @Get()
  @Header('Cache-Control', 'private, max-age=30')
  findAll(
    @Request() req: { user: { tenantId: string } },
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.technicianService.findAll(
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
    return this.technicianService.findOne(id, req.user.tenantId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianDto,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.technicianService.update(id, dto, req.user.tenantId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.technicianService.remove(id, req.user.tenantId);
  }
}
