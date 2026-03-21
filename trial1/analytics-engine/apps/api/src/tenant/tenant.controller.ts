import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentTenant } from '../common/decorators/current-tenant.decorator';
import { TenantService } from './tenant.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Controller('api/tenant')
@UseGuards(JwtAuthGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get()
  async get(@CurrentTenant() tenantId: string) {
    const data = await this.tenantService.get(tenantId);
    return { data };
  }

  @Patch()
  async update(
    @CurrentTenant() tenantId: string,
    @Body() dto: UpdateTenantDto,
  ) {
    const data = await this.tenantService.update(tenantId, dto);
    return { data };
  }

  @Get('usage')
  async getUsage(@CurrentTenant() tenantId: string) {
    const data = await this.tenantService.getUsage(tenantId);
    return { data };
  }
}
