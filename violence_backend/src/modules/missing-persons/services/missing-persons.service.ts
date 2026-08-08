import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { MissingPersonStatus } from '@prisma/client';
import { CreateMissingPersonDto } from '../dto/create-missing-person.dto';
import { UpdateMissingPersonDto } from '../dto/update-missing-person.dto';

@Injectable()
export class MissingPersonsService {
  private readonly logger = new Logger(MissingPersonsService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMissingPersonDto) {
    const missingPerson = await this.prisma.missingPerson.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        age: dto.age,
        description: dto.description,
        photoUrl: dto.photoUrl,
        lastSeenLocation: dto.lastSeenLocation,
        lastSeenDate: new Date(dto.lastSeenDate),
        status: MissingPersonStatus.PENDING, // New reports always start as PENDING for admin review
      },
    });
    this.logger.log(`Missing person report created: ${missingPerson.id}`);
    return missingPerson;
  }

  async findAll(status?: MissingPersonStatus, search?: string) {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { lastSeenLocation: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.missingPerson.findMany({
      where,
      include: {
        _count: {
          select: { sightings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const missingPerson = await this.prisma.missingPerson.findUnique({
      where: { id },
    });
    
    if (!missingPerson) {
      throw new NotFoundException('Missing person record not found');
    }
    
    return missingPerson;
  }

  async update(id: string, dto: UpdateMissingPersonDto) {
    await this.findOne(id); // Verify exists
    
    const updateData: any = { ...dto };
    if (dto.lastSeenDate) {
      updateData.lastSeenDate = new Date(dto.lastSeenDate);
    }
    if (dto.resolvedAt) {
      updateData.resolvedAt = new Date(dto.resolvedAt);
    }

    const updated = await this.prisma.missingPerson.update({
      where: { id },
      data: updateData,
    });
    
    this.logger.log(`Missing person record updated: ${id}`);
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id); // Verify exists
    
    await this.prisma.missingPerson.delete({
      where: { id },
    });
    
    this.logger.log(`Missing person record deleted: ${id}`);
    return { message: 'Missing person record deleted successfully' };
  }

  async markAsFound(id: string) {
    await this.findOne(id); // Verify exists
    
    const updated = await this.prisma.missingPerson.update({
      where: { id },
      data: {
        status: MissingPersonStatus.FOUND,
        resolvedAt: new Date(),
      },
    });
    
    this.logger.log(`Missing person marked as found: ${id}`);
    return updated;
  }

  async countByStatus(status: MissingPersonStatus): Promise<number> {
    return this.prisma.missingPerson.count({
      where: { status },
    });
  }
}
