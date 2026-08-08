import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { MessagingService } from '../services/messaging.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CaseAccessGuard } from '../guards/case-access.guard';
import {
  CreateMessageDto,
  CreateAnonymousMessageDto,
} from '../dto';

interface AuthenticatedRequest {
  user: {
    sub: string;
    email: string;
    role: UserRole;
  };
}

@Controller('cases')
export class MessagingController {
  constructor(private messagingService: MessagingService) {}

  /**
   * Get all messages for a specific case
   * Accessible by: Survivor (own cases), Counselor (all), Medical/Legal (assigned)
   */
  @Get(':id/messages')
  @UseGuards(JwtAuthGuard, RolesGuard, CaseAccessGuard)
  @Roles(
    UserRole.SURVIVOR,
    UserRole.COUNSELOR,
    UserRole.MEDICAL_PROFESSIONAL,
    UserRole.LEGAL_ADVISOR,
    UserRole.ADMIN,
  )
  async getCaseMessages(
    @Param('id') caseId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const messages = await this.messagingService.getCaseMessages(
      caseId,
      req.user.sub,
      req.user.role,
    );

    return {
      success: true,
      data: messages,
    };
  }

  /**
   * Create a new message in a case
   * Accessible by: Survivor (own cases), Counselor (all), Medical/Legal (assigned)
   */
  @Post(':id/messages')
  @UseGuards(JwtAuthGuard, RolesGuard, CaseAccessGuard)
  @Roles(
    UserRole.SURVIVOR,
    UserRole.COUNSELOR,
    UserRole.MEDICAL_PROFESSIONAL,
    UserRole.LEGAL_ADVISOR,
    UserRole.ADMIN,
  )
  async createCaseMessage(
    @Param('id') caseId: string,
    @Body() dto: CreateMessageDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const message = await this.messagingService.createCaseMessage(
      caseId,
      req.user.sub,
      req.user.role,
      dto,
    );

    return {
      success: true,
      data: message,
    };
  }
}

/**
 * Anonymous tracking controller
 * No authentication required
 */
@Controller('track')
export class AnonymousMessagingController {
  constructor(private messagingService: MessagingService) {}

  /**
   * Get messages by tracking number
   * No authentication required
   */
  @Get(':trackingNumber/messages')
  async getMessagesByTrackingNumber(
    @Param('trackingNumber') trackingNumber: string,
  ) {
    const result = await this.messagingService.getMessagesByTrackingNumber(
      trackingNumber,
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Create a message using tracking number
   * No authentication required
   */
  @Post(':trackingNumber/messages')
  async createAnonymousMessage(
    @Param('trackingNumber') trackingNumber: string,
    @Body() dto: CreateAnonymousMessageDto,
  ) {
    // Ensure tracking number from URL matches body
    const message = await this.messagingService.createAnonymousMessage({
      ...dto,
      trackingNumber,
    });

    return {
      success: true,
      data: message,
    };
  }
}
