import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { CasesModule } from '@/modules/cases/cases.module';
import { PatientsController } from './controllers/patients.controller';
import { PatientsService } from './services/patients.service';

@Module({
  imports: [PrismaModule, CasesModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
