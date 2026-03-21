import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';

@Controller('assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  create(@CompanyId() companyId: string, @Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(companyId, dto);
  }

  @Get('work-order/:workOrderId')
  findByWorkOrder(
    @CompanyId() companyId: string,
    @Param('workOrderId') workOrderId: string,
  ) {
    return this.assignmentsService.findByWorkOrder(companyId, workOrderId);
  }

  @Get('technician/:technicianId')
  findByTechnician(
    @CompanyId() companyId: string,
    @Param('technicianId') technicianId: string,
  ) {
    return this.assignmentsService.findByTechnician(companyId, technicianId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id/unassign')
  unassign(@CompanyId() companyId: string, @Param('id') id: string) {
    return this.assignmentsService.unassign(companyId, id);
  }
}
