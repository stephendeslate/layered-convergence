import { Controller, Get, Post, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { EtaService } from './eta.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, JwtPayload } from '@field-service/shared';

@UseGuards(RolesGuard)
@Controller('dispatch')
export class DispatchController {
  constructor(
    private dispatchService: DispatchService,
    private etaService: EtaService,
  ) {}

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Get('board')
  getBoard(@CurrentUser() user: JwtPayload) {
    return this.dispatchService.getBoard(user.companyId);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER)
  @Post('auto-assign/:workOrderId')
  autoAssign(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.dispatchService.autoAssign(user.companyId, workOrderId);
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN, UserRole.CUSTOMER)
  @Get('eta/:workOrderId')
  getEta(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.etaService.calculateEta(workOrderId, user.companyId);
  }
}
