import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AssignedCaseGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const caseId = request.params.caseId || request.params.id;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Admins have full access
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (!caseId) {
      // If no caseId is provided, we can't perform resource-level checks here.
      // Controllers should handle broad access (e.g., getAll) separately.
      return true;
    }

    // 1. Fetch the report/case to check ownership/assignment
    const report = await this.prisma.report.findUnique({
      where: { id: caseId },
      include: {
        caseAssignment: {
          include: {
            supportProviders: true,
          },
        },
      },
    });

    if (!report) {
      throw new ForbiddenException('Case not found');
    }

    const userId = user.sub || user.id;

    // 2. Survivor RBAC: Only access their own reports
    if (user.role === UserRole.SURVIVOR) {
      if (report.reporterId !== userId) {
        throw new ForbiddenException('You only have access to your own reports');
      }
      return true;
    }

    // 3. Professional RBAC (Counselor, Medical, Legal): Only access assigned cases
    if (
      user.role === UserRole.COUNSELOR ||
      user.role === UserRole.MEDICAL_PROFESSIONAL ||
      user.role === UserRole.LEGAL_ADVISOR
    ) {
      const assignment = report.caseAssignment;
      
      if (!assignment) {
        // If unassigned, only counselors/admins can view (for triage)
        // BUT the requirement said Counselors only access assigned referrals.
        // I will allow Counselors to see unassigned reports for triage purpose 
        // unless they are explicitly blocked.
        // Wait, the user said: "Counselors -> only access assigned referrals".
        // This might mean they shouldn't even see unassigned ones.
        // But then who triages them? Usually counselors.
        // I'll stick to the "assigned only" rule for now as requested.
        if (user.role === UserRole.COUNSELOR) {
             // Check if they are the "assignedBy" (who created the assignment)
             // Actually, if it's unassigned, nobody is assigned.
             throw new ForbiddenException('This case is not yet assigned to you');
        }
        throw new ForbiddenException('Access denied. Case not assigned.');
      }

      // Check if user is the primary assignee or a support provider
      // We check by ID and by Email to be safe (linking User to ServiceProvider)
      const isPrimaryAssignee = 
        assignment.assignedToId === userId || 
        assignment.assignedToId === user.email;
        
      const isSupportProvider = assignment.supportProviders.some(
        (p) => p.id === userId || p.email === user.email
      );

      if (isPrimaryAssignee || isSupportProvider) {
        return true;
      }

      throw new ForbiddenException(
        'You do not have access to this case. It is not assigned to you.',
      );
    }

    return false;
  }
}
