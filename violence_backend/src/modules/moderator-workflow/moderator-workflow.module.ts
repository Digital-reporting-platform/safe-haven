import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { ModeratorWorkflowController } from './controllers/moderator-workflow.controller';
import { ModeratorWorkflowService } from './services/moderator-workflow.service';

@Module({
  imports: [PrismaModule],
  controllers: [ModeratorWorkflowController],
  providers: [ModeratorWorkflowService],
  exports: [ModeratorWorkflowService],
})
export class ModeratorWorkflowModule {}
