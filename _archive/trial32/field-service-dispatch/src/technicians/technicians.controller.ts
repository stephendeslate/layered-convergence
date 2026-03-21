import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CompanyContextGuard } from '../common/guards/company-context.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

@Controller('technicians')
@UseGuards(CompanyContextGuard)
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() dto: CreateTechnicianDto) {
    return this.techniciansService.create(companyId, dto);
  }

  @Get()
  findAll(@CompanyId() companyId: string) {
    return this.techniciansService.findAll(companyId);
  }

  @Get('available')
  findAvailable(@CompanyId() companyId: string) {
    return this.techniciansService.findAvailable(companyId);
  }

  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.techniciansService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianDto,
  ) {
    return this.techniciansService.update(companyId, id, dto);
  }

  @Delete(':id')
  delete(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.techniciansService.delete(companyId, id);
  }
}
