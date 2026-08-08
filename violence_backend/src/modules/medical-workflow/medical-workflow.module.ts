import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { CasesModule } from '@/modules/cases/cases.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { MedicalWorkflowController } from './controllers/medical-workflow.controller';
import { MedicalWorkflowService } from './services/medical-workflow.service';

@Module({
  imports: [PrismaModule, CasesModule, NotificationModule],
  controllers: [MedicalWorkflowController],
  providers: [MedicalWorkflowService],
})
export class MedicalWorkflowModule {}

