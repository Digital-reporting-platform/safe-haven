import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { SystemSettingsController } from './controllers/system-settings.controller';
import { SystemSettingsService } from './services/system-settings.service';

@Module({
  imports: [PrismaModule],
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService],
  exports: [SystemSettingsService],
})
export class SystemSettingsModule {}
