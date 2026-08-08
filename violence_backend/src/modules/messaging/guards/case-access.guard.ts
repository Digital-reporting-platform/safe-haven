import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UserRole } from '@prisma/client';

interface RequestWithUser {
  user: {
    sub: string;  // JWT subject (user ID)
    email: string;
    role: string; // Role comes as string from JWT
  };
  params: {
    id?: string;
    caseId?: string;
  };
}

@Injectable()
export class CaseAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('[CaseAccessGuard] START - canActivate called');

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const caseId = request.params.id || request.params.caseId;

    console.log('[CaseAccessGuard] RAW REQUEST:', {
      params: request.params,
      hasUser: !!user,
      userKeys: user ? Object.keys(user) : null,
      caseId,
    });

    if (!user) {
      console.log('[CaseAccessGuard] NO USER - rejecting');
      throw new ForbiddenException('No user in request');
    }

    const userId = user.sub; // JWT subject is the user ID

    console.log('[CaseAccessGuard] ENTRY:', {
      userId,
      role: user?.role,
      caseId,
      hasUser: !!user,
      userRoleEnum: UserRole.SURVIVOR,
    });

    if (!caseId) {
      throw new ForbiddenException('Case ID is required');
    }

    if (!user || !user.role) {
      console.log('[CaseAccessGuard] No user or role found');
      throw new ForbiddenException('Authentication required');
    }

    // Admins and counselors can access all cases
    if (user.role === 'ADMIN' || user.role === 'COUNSELOR') {
      console.log('[CaseAccessGuard] Admin/Counselor access granted');
      return true;
    }

    // Log role for debugging
    console.log('[CaseAccessGuard] Role check:', {
      userRole: user.role,
      isSurvivor: user.role === 'SURVIVOR',
    });

    // Get the case with report details
    const caseAssignment = await this.prisma.caseAssignment.findUnique({
      where: { id: caseId },
      include: {
        report: {
          select: {
            reporterId: true,
            isAnonymous: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            type: true,
          },
        },
        supportProviders: {
          select: {
            id: true,
            type: true,
          },
        },
      },
    });

    if (!caseAssignment) {
      throw new NotFoundException('Case not found');
    }

    // Survivor can only access their own cases
    if (user.role === UserRole.SURVIVOR) {
      // Debug logging
      console.log('[CaseAccessGuard] Survivor access check:', {
        userId: userId,
        reporterId: caseAssignment.report.reporterId,
        isAnonymous: caseAssignment.report.isAnonymous,
        caseId,
      });

      // Allow access if reporterId matches current user
      if (caseAssignment.report.reporterId === userId) {
        console.log('[CaseAccessGuard] Access granted: reporterId matches userId');
        return true;
      }

      // Allow access to anonymous reports (reporterId is null)
      // The user must have the caseAssignment ID which acts as a secure token
      if (caseAssignment.report.isAnonymous && !caseAssignment.report.reporterId) {
        console.log('[CaseAccessGuard] Access granted: anonymous report with no reporterId');
        return true;
      }

      console.log('[CaseAccessGuard] Access denied: reporterId does not match', {
        userId,
        reporterId: caseAssignment.report.reporterId,
        match: caseAssignment.report.reporterId === userId,
        types: {
          userId: typeof userId,
          reporterId: typeof caseAssignment.report.reporterId
        }
      });
      throw new ForbiddenException('You can only access your own cases');
    }

    // Medical and Legal professionals can only access assigned cases
    if (
      user.role === 'MEDICAL_PROFESSIONAL' ||
      user.role === 'LEGAL_ADVISOR'
    ) {
      // Get the provider profile linked to this user
      const provider = await this.prisma.serviceProvider.findFirst({
        where: {
          OR: [
            { email: user.email },
            { phone: user.email }, // Some providers might have phone as contact
          ],
        },
      });

      if (!provider) {
        throw new ForbiddenException('No provider profile found for your account');
      }

      // Check if they're the assigned professional or support provider
      const isAssigned =
        caseAssignment.assignedToId === provider.id ||
        caseAssignment.supportProviders.some((p) => p.id === provider.id);

      if (!isAssigned) {
        throw new ForbiddenException('You can only access your assigned cases');
      }

      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
