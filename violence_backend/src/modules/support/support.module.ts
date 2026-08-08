import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { SupportController } from './controllers/support.controller';
import { SupportService } from './services/support.service';

@Module({
  imports: [PrismaModule],
  controllers: [SupportController],
  providers: [SupportService],
  exports: [SupportService],
})
export class SupportModule {}
