import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReportsModule } from './modules/reports/reports.module';
import { CasesModule } from './modules/cases/cases.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ProfessionalsModule } from './modules/professionals/professionals.module';
import { ClassificationModule } from './modules/classification/classification.module';
import { ForumModule } from './modules/forum/forum.module';
import { SupportModule } from './modules/support/support.module';
import { NotificationModule } from './modules/notification/notification.module';
import { SystemSettingsModule } from './modules/system-settings/system-settings.module';
import { PatientsModule } from './modules/patients/patients.module';
import { MedicalProfileModule } from './modules/medical-profile/medical-profile.module';
import { MedicalWorkflowModule } from './modules/medical-workflow/medical-workflow.module';
import { LegalWorkflowModule } from './modules/legal-workflow/legal-workflow.module';
import { ModeratorWorkflowModule } from './modules/moderator-workflow/moderator-workflow.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
import { MissingPersonsModule } from './modules/missing-persons/missing-persons.module';
import { JobPortalModule } from './modules/job-portal/jobportal.module';
import { ContactModule } from './modules/contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get('THROTTLE_TTL') || 60000,
            limit: config.get('THROTTLE_LIMIT') || 100,
          },
        ],
      }),
    }),
    PrismaModule,
    AuthModule,
    ReportsModule,
    CasesModule,
    AnalyticsModule,
    ProfessionalsModule,
    ClassificationModule,
    ForumModule,
    SupportModule,
    NotificationModule,
    SystemSettingsModule,
    PatientsModule,
    MedicalProfileModule,
    MedicalWorkflowModule,
    LegalWorkflowModule,
    ModeratorWorkflowModule,
    MessagingModule,
    WorkflowModule,
    MissingPersonsModule,
    JobPortalModule,
    ContactModule,
  ],
})
export class AppModule {}
