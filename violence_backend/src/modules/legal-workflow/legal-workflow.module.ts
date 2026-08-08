import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { CasesModule } from '@/modules/cases/cases.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { LegalWorkflowController } from './controllers/legal-workflow.controller';
import { LegalWorkflowService } from './services/legal-workflow.service';

@Module({
  imports: [PrismaModule, CasesModule, NotificationModule],
  controllers: [LegalWorkflowController],
  providers: [LegalWorkflowService],
  exports: [LegalWorkflowService],
})
export class LegalWorkflowModule {}
