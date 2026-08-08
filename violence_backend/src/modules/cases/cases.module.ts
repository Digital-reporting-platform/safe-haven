import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { MessagingModule } from '../messaging/messaging.module';
import { CasesController } from './controllers/cases.controller';
import { CaseManagementService } from './services/case-management.service';

@Module({
  imports: [
    PrismaModule,
    MessagingModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRATION') || '24h' },
      }),
    }),
  ],
  controllers: [CasesController],
  providers: [CaseManagementService],
  exports: [CaseManagementService],
})
export class CasesModule {}
