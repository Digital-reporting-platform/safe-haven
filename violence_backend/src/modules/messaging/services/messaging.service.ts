import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UserRole, CaseComment, MessageAudience } from '@prisma/client';
import { CreateMessageDto, CreateAnonymousMessageDto } from '../dto';
import * as crypto from 'crypto';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);
  
  // Simple in-memory rate limiter: trackingNumber -> timestamp[]
  private readonly anonymousMessageRateLimit = new Map<string, number[]>();
  private readonly RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
  private readonly RATE_LIMIT_MAX_MESSAGES = 5;

  constructor(private prisma: PrismaService) {}

  /**
   * Check rate limit for anonymous messages.
   * Throws BadRequestException if limit exceeded.
   */
  private checkAnonymousMessageRateLimit(trackingNumber: string): void {
    const now = Date.now();
    const timestamps = this.anonymousMessageRateLimit.get(trackingNumber) || [];
    
    // Remove timestamps older than the window
    const recentTimestamps = timestamps.filter(
      (ts) => now - ts < this.RATE_LIMIT_WINDOW_MS,
    );
    
    if (recentTimestamps.length >= this.RATE_LIMIT_MAX_MESSAGES) {
      throw new BadRequestException(
        `Rate limit exceeded. Maximum ${this.RATE_LIMIT_MAX_MESSAGES} messages per minute.`,
      );
    }
    
    // Add current timestamp and update map
    recentTimestamps.push(now);
    this.anonymousMessageRateLimit.set(trackingNumber, recentTimestamps);
    
    // Cleanup old entries periodically (simple approach)
    if (this.anonymousMessageRateLimit.size > 1000) {
      for (const [key, values] of this.anonymousMessageRateLimit.entries()) {
        const recent = values.filter((ts) => now - ts < this.RATE_LIMIT_WINDOW_MS);
        if (recent.length === 0) {
          this.anonymousMessageRateLimit.delete(key);
        } else {
          this.anonymousMessageRateLimit.set(key, recent);
        }
      }
    }
  }

  /**
   * Generate a unique tracking number for anonymous access.
   * Format: REF-XXXXXX (6 characters from an unambiguous alphabet)
   * Uses crypto.randomBytes for cryptographic randomness.
   */
  generateTrackingNumber(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded I, O, 0, 1 for clarity
    const bytes = crypto.randomBytes(6);
    let result = 'REF-';
    for (let i = 0; i < 6; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  /**
   * Get messages for a specific case
   * Validates user has access to this case and filters by audience
   */
  async getCaseMessages(
    caseId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<CaseComment[]> {
    // Validate case exists and user has access
    const caseAssignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
      include: {
        report: {
          select: {
            id: true,
            reporterId: true,
            isAnonymous: true,
          },
        },
        assignedTo: { select: { id: true } },
        supportProviders: { select: { id: true } },
      },
    });

    if (!caseAssignment) {
      throw new NotFoundException('Case not found');
    }

    // Check access permissions
    this.validateCaseAccess(caseAssignment, userId, userRole);

    // Build audience filter based on user role
    let audienceFilter: any;
    switch (userRole) {
      case UserRole.SURVIVOR:
        // Survivors only see messages intended for them
        audienceFilter = {
          OR: [
            { audience: MessageAudience.ALL },
            { audience: MessageAudience.SURVIVOR },
          ],
        };
        break;
      case UserRole.MEDICAL_PROFESSIONAL:
      case UserRole.LEGAL_ADVISOR:
        // Professionals only see messages intended for them
        audienceFilter = {
          OR: [
            { audience: MessageAudience.ALL },
            { audience: MessageAudience.ASSIGNED_PROFESSIONAL },
          ],
        };
        break;
      case UserRole.COUNSELOR:
      case UserRole.ADMIN:
        // Counselors and admins see all messages
        audienceFilter = {}; // No audience filtering
        break;
      default:
        // For any other roles, only show messages intended for all
        audienceFilter = { audience: MessageAudience.ALL };
        break;
    }

    // Get messages for this case's report with audience filtering
    return this.prisma.caseComment.findMany({
      where: {
        reportId: caseAssignment.reportId,
        isPublic: true, // Only show public messages in thread
        ...audienceFilter,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Create a new message in a case
   */
  async createCaseMessage(
    caseId: string,
    userId: string,
    userRole: UserRole,
    dto: CreateMessageDto,
  ): Promise<CaseComment> {
    const caseAssignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
      include: {
        report: { select: { id: true, reporterId: true } },
        assignedTo: { select: { id: true } },
        supportProviders: { select: { id: true } },
      },
    });

    if (!caseAssignment) {
      throw new NotFoundException('Case not found');
    }

    // Validate access
    this.validateCaseAccess(caseAssignment, userId, userRole);

    // Determine the correct sender role
    const senderRole = dto.senderRole || userRole;

    // Create the message
    const message = await this.prisma.caseComment.create({
      data: {
        reportId: caseAssignment.reportId,
        authorId: userId,
        senderRole: senderRole,
        content: dto.content,
        isSystemMessage: dto.isSystemMessage || false,
        isPublic: true,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    this.logger.log(
      `Message created in case ${caseId} by user ${userId} (${senderRole})`,
    );

    return message;
  }

  /**
   * Get messages using anonymous tracking number
   * No authentication required
   */
  async getMessagesByTrackingNumber(trackingNumber: string): Promise<{
    report: {
      id: string;
      title: string;
      status: string;
      createdAt: Date;
      trackingNumber: string;
    };
    messages: CaseComment[];
    assignedProfessionals: {
      id: string;
      name: string;
      type: string;
    }[];
  }> {
    const report = await this.prisma.report.findUnique({
      where: { trackingNumber },
      include: {
        caseAssignment: {
          include: {
            assignedTo: { select: { id: true, name: true, type: true } },
            supportProviders: { select: { id: true, name: true, type: true } },
          },
        },
        caseComments: {
          where: {
            isPublic: true,
            audience: {
              in: ['SURVIVOR', 'ALL'],
            },
          },
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Invalid tracking number');
    }

    const assignedProfessionals: { id: string; name: string; type: string }[] =
      [];

    if (report.caseAssignment) {
      assignedProfessionals.push(report.caseAssignment.assignedTo);
      assignedProfessionals.push(...report.caseAssignment.supportProviders);
    }

    return {
      report: {
        id: report.id,
        title: report.title,
        status: report.status,
        createdAt: report.createdAt,
        trackingNumber: report.trackingNumber!,
      },
      messages: report.caseComments,
      assignedProfessionals,
    };
  }

  /**
   * Create a message using anonymous tracking number
   * No authentication required
   */
  async createAnonymousMessage(
    dto: CreateAnonymousMessageDto,
  ): Promise<CaseComment> {
    // Check rate limit FIRST
    this.checkAnonymousMessageRateLimit(dto.trackingNumber);

    const report = await this.prisma.report.findUnique({
      where: { trackingNumber: dto.trackingNumber },
      include: {
        caseAssignment: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Invalid tracking number');
    }

    // Check if case is still active — only block CLOSED, not RESOLVED
    // (survivor should be able to communicate during RESOLVED before closure)
    if (report.status === 'CLOSED') {
      throw new BadRequestException(
        'This case has been closed. No new messages can be added.',
      );
    }

    // Create anonymous message
    // senderId is null for anonymous messages
    const message = await this.prisma.caseComment.create({
      data: {
        reportId: report.id,
        authorId: null, // Anonymous
        senderRole: UserRole.SURVIVOR, // Reported as survivor
        content: dto.content,
        isSystemMessage: false,
        isPublic: true,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    this.logger.log(
      `Anonymous message created for report ${report.id} via tracking ${dto.trackingNumber}`,
    );

    return message;
  }

  /**
   * Create a system-generated message
   * Used when case is assigned, status changes, etc.
   * @param audience - Who should see this message (default: ALL)
   */
  async createSystemMessage(
    reportId: string,
    content: string,
    audience: MessageAudience = MessageAudience.ALL,
  ): Promise<CaseComment> {
    const message = await this.prisma.caseComment.create({
      data: {
        reportId,
        authorId: null, // System messages have no author
        senderRole: UserRole.SYSTEM,
        content,
        isSystemMessage: true,
        isPublic: true,
        audience,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    this.logger.log(`System message created for report ${reportId} (audience: ${audience})`);

    return message;
  }

  /**
   * Generate tracking number for a report if it doesn't have one
   */
  async assignTrackingNumber(reportId: string): Promise<string> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      select: { trackingNumber: true },
    });

    if (report?.trackingNumber) {
      return report.trackingNumber;
    }

    // Generate unique tracking number
    let trackingNumber = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      trackingNumber = this.generateTrackingNumber();
      const existing = await this.prisma.report.findUnique({
        where: { trackingNumber },
        select: { id: true },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new BadRequestException(
        'Failed to generate unique tracking number',
      );
    }

    // Update report with tracking number
    await this.prisma.report.update({
      where: { id: reportId },
      data: { trackingNumber },
    });

    return trackingNumber!;
  }

  /**
   * Validate user has access to a case
   */
  private validateCaseAccess(
    caseAssignment: any,
    userId: string,
    userRole: UserRole,
  ): void {
    // Admin and Counselor can access all cases
    if (userRole === UserRole.ADMIN || userRole === UserRole.COUNSELOR) {
      return;
    }

    // Survivor can only access their own cases
    if (userRole === UserRole.SURVIVOR) {
      if (caseAssignment.report.reporterId !== userId) {
        throw new ForbiddenException('You can only access your own cases');
      }
      return;
    }

    // Medical and Legal professionals can only access assigned cases
    if (
      userRole === UserRole.MEDICAL_PROFESSIONAL ||
      userRole === UserRole.LEGAL_ADVISOR
    ) {
      const isAssigned =
        caseAssignment.assignedToId === userId ||
        caseAssignment.supportProviders.some((p: any) => p.id === userId);

      if (!isAssigned) {
        throw new ForbiddenException('You can only access your assigned cases');
      }
      return;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
