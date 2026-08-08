import { Module } from '@nestjs/common';
import { StatusWorkflowService } from './services/status-workflow.service';
import { ProgressController } from './controllers/progress.controller';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  providers: [StatusWorkflowService, PrismaService],
  controllers: [ProgressController],
  exports: [StatusWorkflowService],
})
export class WorkflowModule {}
