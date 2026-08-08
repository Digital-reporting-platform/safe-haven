import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class JobPortalService {
  constructor(private prisma: PrismaService) {}

  async getPublicJobs() {
    return this.prisma.jobOpportunity.findMany({
      where: { isVerified: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRecommendedJobs(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            caseAssignment: {
              include: {
                assignedTo: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const latestReport = user.reports?.[0];
    const hasActiveCounselorAssignment =
      latestReport?.caseAssignment?.status === 'ACTIVE' &&
      latestReport?.caseAssignment?.assignedTo?.type === 'COUNSELOR';


    if (!latestReport) {
      return this.getPublicJobs();
    }

    const pool = await this.prisma.jobOpportunity.findMany({
      where: { isVerified: true },
    });

    return pool.map((job: any) => {
      let matchScore = 0;
      if (job.source === 'NGOJOBS') matchScore += 30;
      
      if (latestReport.category === 'DOMESTIC_VIOLENCE' && job.tags?.includes('REMOTE')) {
        matchScore += 50;
      }

      if (hasActiveCounselorAssignment && job.tags?.includes('LOW_STRESS')) {
        matchScore += 20;
      }

      return { ...job, matchScore };
    })
    .filter((j: any) => j.matchScore > 0)
    .sort((a: any, b: any) => b.matchScore - a.matchScore);
  }

  // Save a job
  async saveJob(userId: string, jobId: string) {
    const job = await this.prisma.jobOpportunity.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if already saved
    const existing = await this.prisma.savedJob.findUnique({
      where: {
        userId_jobOpportunityId: {
          userId,
          jobOpportunityId: jobId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Job already saved');
    }

    return this.prisma.savedJob.create({
      data: {
        userId,
        jobOpportunityId: jobId,
      },
      include: {
        jobOpportunity: true,
      },
    });
  }

  // Unsave a job
  async unsaveJob(userId: string, jobId: string) {
    const saved = await this.prisma.savedJob.findUnique({
      where: {
        userId_jobOpportunityId: {
          userId,
          jobOpportunityId: jobId,
        },
      },
    });

    if (!saved) {
      throw new NotFoundException('Saved job not found');
    }

    await this.prisma.savedJob.delete({
      where: { id: saved.id },
    });

    return { message: 'Job unsaved successfully' };
  }

  // Get saved jobs
  async getSavedJobs(userId: string) {
    return this.prisma.savedJob.findMany({
      where: { userId },
      include: {
        jobOpportunity: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Create job application
  async applyToJob(userId: string, jobId: string, notes?: string) {
    const job = await this.prisma.jobOpportunity.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Check if already applied
    const existing = await this.prisma.jobApplication.findFirst({
      where: {
        userId,
        jobOpportunityId: jobId,
      },
    });

    if (existing) {
      throw new BadRequestException('Already applied to this job');
    }

    return this.prisma.jobApplication.create({
      data: {
        userId,
        jobOpportunityId: jobId,
        notes,
      },
      include: {
        jobOpportunity: true,
      },
    });
  }

  // Get user's job applications
  async getMyApplications(userId: string) {
    return this.prisma.jobApplication.findMany({
      where: { userId },
      include: {
        jobOpportunity: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  // Update application status
  async updateApplicationStatus(userId: string, applicationId: string, status: string) {
    const application = await this.prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        userId,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { status: status as any },
      include: {
        jobOpportunity: true,
      },
    });
  }
}