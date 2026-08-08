import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { MedicalProfileController } from './controllers/medical-profile.controller';
import { MedicalProfileService } from './services/medical-profile.service';

@Module({
  imports: [PrismaModule],
  controllers: [MedicalProfileController],
  providers: [MedicalProfileService],
})
export class MedicalProfileModule {}

