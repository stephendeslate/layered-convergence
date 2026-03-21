import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { TransitionWorkOrderDto } from './dto/transition-work-order.dto';
import { AssignWorkOrderDto } from './dto/assign-work-order.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole, JwtPayload } from '@field-service/shared';

@UseGuards(RolesGuard)
@Controller('work-orders')
export class WorkOrdersController {
  constructor(private workOrdersService: WorkOrdersService) {}

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(user.companyId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.workOrdersService.findAll(user.companyId);
  }

  @Public()
  @Get('tracking/:token')
  findByTrackingToken(@Param('token') token: string) {
    return this.workOrdersService.findByTrackingToken(token);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN)
  @Get(':id')
  findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.workOrdersService.findById(id, user.companyId);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.workOrdersService.update(id, user.companyId, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN)
  @Post(':id/transition')
  transition(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: TransitionWorkOrderDto,
  ) {
    return this.workOrdersService.transitionStatus(
      id,
      user.companyId,
      dto.toStatus,
      user.sub,
      user.role,
      dto.note,
    );
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Post(':id/assign')
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AssignWorkOrderDto,
  ) {
    return this.workOrdersService.assign(id, user.companyId, dto.technicianId, user.sub);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Get(':id/history')
  getHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.workOrdersService.getHistory(id, user.companyId);
  }
}
