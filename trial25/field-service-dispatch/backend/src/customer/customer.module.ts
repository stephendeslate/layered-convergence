import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { TenantContextModule } from '../tenant/tenant-context.module';

@Module({
  imports: [TenantContextModule],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
