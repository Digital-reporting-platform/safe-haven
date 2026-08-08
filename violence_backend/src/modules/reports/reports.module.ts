import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ClassificationModule } from '../classification/classification.module';
import { NotificationModule } from '../notification/notification.module';
import { CasesModule } from '../cases/cases.module';
import { WorkflowModule } from '../workflow/workflow.module';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { LocationValidationService } from './services/location-validation.service';

@Module({
  imports: [
    PrismaModule,
    ClassificationModule,
    NotificationModule,
    CasesModule,
    WorkflowModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRATION') || '24h' },
      }),
    }),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, LocationValidationService],
  exports: [ReportsService],
})
export class ReportsModule {}
