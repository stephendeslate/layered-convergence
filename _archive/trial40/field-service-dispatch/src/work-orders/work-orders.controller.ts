import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { UpdateWorkOrderStatusDto } from './dto/update-work-order-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/guards/jwt-auth.guard';

@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(companyId, dto);
  }

  @Get()
  findAll(@CompanyId() companyId: string) {
    return this.workOrdersService.findAll(companyId);
  }

  @Get(':id')
  findOne(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.workOrdersService.findOne(companyId, id);
  }

  @Put(':id')
  update(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.workOrdersService.update(companyId, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.workOrdersService.updateStatus(companyId, id, dto, user.sub);
  }

  @Patch(':id/assign/:technicianId')
  assignTechnician(
    @CompanyId() companyId: string,
    @Param('id') id: string,
    @Param('technicianId') technicianId: string,
  ) {
    return this.workOrdersService.assignTechnician(companyId, id, technicianId);
  }

  @Delete(':id')
  remove(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.workOrdersService.remove(companyId, id);
  }
}
