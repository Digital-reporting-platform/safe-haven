import { Module } from '@nestjs/common';
import { ContactController } from './controllers/contact.controller';
import { ContactService } from './services/contact.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
