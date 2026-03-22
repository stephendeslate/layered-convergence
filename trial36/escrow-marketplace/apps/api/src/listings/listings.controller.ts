import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto, UpdateListingDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { sub: string; role: string; tenantId: string };
}

@Controller('listings')
@UseGuards(JwtAuthGuard)
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.listingsService.findAll(
      req.user.tenantId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.listingsService.findOne(id, req.user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateListingDto, @Request() req: AuthenticatedRequest) {
    return this.listingsService.create(dto, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateListingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.listingsService.update(id, dto, req.user);
  }
}
