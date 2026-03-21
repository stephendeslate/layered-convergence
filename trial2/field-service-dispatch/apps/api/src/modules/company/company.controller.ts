import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, JwtPayload } from '@field-service/shared';

@UseGuards(RolesGuard)
@Controller('companies')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Roles(UserRole.ADMIN)
  @Get('current')
  getCurrent(@CurrentUser() user: JwtPayload) {
    return this.companyService.findById(user.companyId);
  }

  @Roles(UserRole.ADMIN)
  @Patch('current')
  updateCurrent(
    @CurrentUser() user: JwtPayload,
    @Body() data: { name?: string; address?: string; phone?: string; email?: string },
  ) {
    return this.companyService.update(user.companyId, data);
  }
}
