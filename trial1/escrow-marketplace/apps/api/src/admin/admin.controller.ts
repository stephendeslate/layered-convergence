import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  AdminTransactionQueryDto,
  AdminDisputeQueryDto,
  AdminProviderQueryDto,
  AdminWebhookQueryDto,
} from './dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('transactions')
  async getTransactions(@Query() query: AdminTransactionQueryDto) {
    return this.adminService.getTransactions(query);
  }

  @Get('disputes')
  async getDisputes(@Query() query: AdminDisputeQueryDto) {
    return this.adminService.getDisputes(query);
  }

  @Get('providers')
  async getProviders(@Query() query: AdminProviderQueryDto) {
    return this.adminService.getProviders(query);
  }

  @Get('webhooks')
  async getWebhookLogs(@Query() query: AdminWebhookQueryDto) {
    return this.adminService.getWebhookLogs(query);
  }

  @Get('health')
  async getPlatformHealth() {
    return this.adminService.getPlatformHealth();
  }
}
