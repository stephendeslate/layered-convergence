import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ListingService } from './listing.service';

@UseGuards(AuthGuard('jwt'))
@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Get()
  async findAll(@Request() req: { user: { tenantId: string } }) {
    return this.listingService.findAll(req.user.tenantId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: { tenantId: string } },
  ) {
    return this.listingService.findOne(id, req.user.tenantId);
  }

  @Post()
  async create(
    @Body() body: { title: string; description: string; price: number },
    @Request() req: { user: { tenantId: string; userId: string } },
  ) {
    return this.listingService.create(body.title, body.description, body.price, req.user.tenantId, req.user.userId);
  }
}
