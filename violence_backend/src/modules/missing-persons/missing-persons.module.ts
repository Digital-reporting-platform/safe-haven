import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { MissingPersonsController } from './controllers/missing-persons.controller';
import { MissingPersonsService } from './services/missing-persons.service';

@Module({
  imports: [PrismaModule],
  controllers: [MissingPersonsController],
  providers: [MissingPersonsService],
  exports: [MissingPersonsService],
})
export class MissingPersonsModule {}
