import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { WorkOrderModule } from './workorder/workorder.module';
import { RouteModule } from './route/route.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
    AuthModule,
    WorkOrderModule,
    RouteModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
