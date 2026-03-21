import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController, PortalController } from './customer.controller';

@Module({
  controllers: [CustomerController, PortalController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
