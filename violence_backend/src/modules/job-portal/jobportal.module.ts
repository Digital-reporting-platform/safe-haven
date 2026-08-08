import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { JobPortalController } from './job-portal.controller';
import { JobPortalService } from './job-portal.service';
import { JobSyncService } from './job-sync.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ClassificationModule } from '../classification/classification.module';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    ScheduleModule.forRoot(),
    ClassificationModule,
  ],
  controllers: [JobPortalController],
  providers: [JobPortalService, JobSyncService],
  exports: [JobPortalService, JobSyncService],
})
export class JobPortalModule {}