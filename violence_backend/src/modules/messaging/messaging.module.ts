import { Module } from '@nestjs/common';
import { MessagingService } from './services/messaging.service';
import { MessagingController, AnonymousMessagingController } from './controllers/messaging.controller';
import { CaseAccessGuard } from './guards/case-access.guard';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MessagingController, AnonymousMessagingController],
  providers: [MessagingService, CaseAccessGuard],
  exports: [MessagingService],
})
export class MessagingModule {}
