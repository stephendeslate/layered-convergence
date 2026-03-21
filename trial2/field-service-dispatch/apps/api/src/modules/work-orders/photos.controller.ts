import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, JwtPayload } from '@field-service/shared';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UploadPhotoDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsOptional()
  @IsString()
  caption?: string;
}

@UseGuards(RolesGuard)
@Controller('work-orders/:workOrderId/photos')
export class PhotosController {
  constructor(private prisma: PrismaService) {}

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN)
  @Post()
  async upload(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UploadPhotoDto,
  ) {
    await this.prisma.workOrder.findFirstOrThrow({
      where: { id: workOrderId, companyId: user.companyId },
    });

    return this.prisma.jobPhoto.create({
      data: {
        workOrderId,
        companyId: user.companyId,
        url: dto.url,
        caption: dto.caption,
        uploadedBy: user.sub,
      },
    });
  }

  @Roles(UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN)
  @Get()
  async list(
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.prisma.workOrder.findFirstOrThrow({
      where: { id: workOrderId, companyId: user.companyId },
    });

    return this.prisma.jobPhoto.findMany({
      where: { workOrderId, companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
