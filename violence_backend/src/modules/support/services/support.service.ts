import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(private prisma: PrismaService) {}

  async createRequest(userId: string, dto: { serviceProviderId: string; description: string }) {
    const request = await this.prisma.supportRequest.create({
      data: {
        userId,
        serviceProviderId: dto.serviceProviderId,
        description: dto.description,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        serviceProvider: true,
      },
    });
    this.logger.log(`Support request created: ${request.id}`);
    return request;
  }

  async getUserRequests(userId: string) {
    return this.prisma.supportRequest.findMany({
      where: { userId },
      include: { serviceProvider: true },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async getProviderRequests(providerId: string) {
    return this.prisma.supportRequest.findMany({
      where: { serviceProviderId: providerId },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async updateRequestStatus(id: string, status: string) {
    const request = await this.prisma.supportRequest.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    
    const data: any = { status: status as any };
    if (status === 'ACCEPTED') data.respondedAt = new Date();
    if (status === 'COMPLETED') data.resolvedAt = new Date();
    
    return this.prisma.supportRequest.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        serviceProvider: true,
      },
    });
  }
}
