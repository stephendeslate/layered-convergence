import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dispute.dto';

@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('disputes')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  async create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateDisputeDto,
  ) {
    return this.disputeService.create(userId, dto);
  }

  @Get()
  async findByUser(@Headers('x-user-id') userId: string) {
    return this.disputeService.findByUser(userId);
  }

  @Get(':id')
  async findById(
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
  ) {
    return this.disputeService.findById(userId, id);
  }

  @Post(':id/resolve')
  async resolve(
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputeService.resolve(id, dto);
  }
}
