import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ClassificationController } from './controllers/classification.controller';
import { ClassificationService } from './services/classification.service';

@Module({
  imports: [PrismaModule],
  controllers: [ClassificationController],
  providers: [ClassificationService],
  exports: [ClassificationService],
})
export class ClassificationModule {}
