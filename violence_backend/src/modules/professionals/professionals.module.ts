import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ProfessionalsController } from './controllers/professionals.controller';
import { ProfessionalsService } from './services/professionals.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProfessionalsController],
  providers: [ProfessionalsService],
  exports: [ProfessionalsService],
})
export class ProfessionalsModule {}
