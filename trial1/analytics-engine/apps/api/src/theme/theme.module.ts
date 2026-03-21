import { Module } from '@nestjs/common';
import { ThemeController, EmbedThemeController } from './theme.controller';
import { ThemeService } from './theme.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ThemeController, EmbedThemeController],
  providers: [ThemeService],
  exports: [ThemeService],
})
export class ThemeModule {}
