import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateContactDto } from '../dto/create-contact.dto';
import { ContactSubmission, ContactStatus, ContactInquiryType } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private prisma: PrismaService) {}

  async createContact(createContactDto: CreateContactDto, req?: Request): Promise<ContactSubmission> {
    try {
      // Map frontend inquiry types to backend enum values
      const inquiryTypeMap: Record<string, ContactInquiryType> = {
        'general': ContactInquiryType.GENERAL,
        'privacy': ContactInquiryType.PRIVACY,
        'technical': ContactInquiryType.TECHNICAL,
        'legal': ContactInquiryType.LEGAL,
        'accessibility': ContactInquiryType.ACCESSIBILITY,
        'partnership': ContactInquiryType.PARTNERSHIP,
        'billing': ContactInquiryType.BILLING,
        'media': ContactInquiryType.MEDIA,
      };

      const mappedInquiryType = inquiryTypeMap[createContactDto.inquiryType] || ContactInquiryType.GENERAL;

      const contact = await this.prisma.contactSubmission.create({
        data: {
          ...createContactDto,
          inquiryType: mappedInquiryType,
          ipAddress: req?.ip,
          userAgent: req?.get('User-Agent'),
        },
      });

      this.logger.log(`Contact submission created: ${contact.id} from ${contact.email}`);
      
      // TODO: Send email notification to admin team
      // await this.emailService.notifyNewContact(contact);

      return contact;
    } catch (error) {
      this.logger.error('Failed to create contact submission', error);
      throw new BadRequestException('Failed to submit contact form');
    }
  }

  async getAllContacts(status?: ContactStatus, page = 1, limit = 20): Promise<{
    contacts: ContactSubmission[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where = status ? { status } : {};
    
    const [contacts, total] = await Promise.all([
      this.prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contactSubmission.count({ where }),
    ]);

    return {
      contacts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getContactById(id: string): Promise<ContactSubmission | null> {
    return this.prisma.contactSubmission.findUnique({
      where: { id },
    });
  }

  async updateContactStatus(id: string, status: ContactStatus): Promise<ContactSubmission> {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { status },
    });
  }

  async deleteContact(id: string): Promise<void> {
    await this.prisma.contactSubmission.delete({
      where: { id },
    });
  }

  async getContactStats(): Promise<{
    total: number;
    new: number;
    inProgress: number;
    responded: number;
    resolved: number;
    byInquiryType: Record<ContactInquiryType, number>;
    byUrgency: Record<string, number>;
  }> {
    const [total, statusCounts, inquiryCounts, urgencyCounts] = await Promise.all([
      this.prisma.contactSubmission.count(),
      this.prisma.contactSubmission.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.contactSubmission.groupBy({
        by: ['inquiryType'],
        _count: true,
      }),
      this.prisma.contactSubmission.groupBy({
        by: ['urgency'],
        _count: true,
      }),
    ]);

    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item.status as ContactStatus] = item._count;
      return acc;
    }, {} as Record<ContactStatus, number>);

    const inquiryMap = inquiryCounts.reduce((acc, item) => {
      acc[item.inquiryType as ContactInquiryType] = item._count;
      return acc;
    }, {} as Record<ContactInquiryType, number>);

    const urgencyMap = urgencyCounts.reduce((acc, item) => {
      acc[item.urgency as string] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      new: statusMap[ContactStatus.NEW] || 0,
      inProgress: statusMap[ContactStatus.IN_PROGRESS] || 0,
      responded: statusMap[ContactStatus.RESPONDED] || 0,
      resolved: statusMap[ContactStatus.RESOLVED] || 0,
      byInquiryType: inquiryMap,
      byUrgency: urgencyMap,
    };
  }
}
