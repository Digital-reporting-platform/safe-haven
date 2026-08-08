import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { reportBaseSelect } from '../../reports/constants/report-selects';
import { Prisma, UserRole, ReportStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  private isMissingContactEmailColumnError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2022' &&
      typeof (error as any).message === 'string' &&
      (error as any).message.includes('Report.contactEmail')
    );
  }

  private removeContactEmailFromSelect(select: Prisma.ReportSelect): Prisma.ReportSelect {
    const { contactEmail, ...selectWithoutContactEmail } = select as any;
    return selectWithoutContactEmail as Prisma.ReportSelect;
  }

  /**
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics(days: number = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    let reports: any[] = [];
    const [cases, professionals] = await Promise.all([
      this.prisma.caseAssignment.findMany({
        where: { createdAt: { gte: fromDate } },
      }),
      this.prisma.serviceProvider.findMany({
        where: { isVerified: true },
      }),
    ]);

    try {
      reports = await this.prisma.report.findMany({
        where: { createdAt: { gte: fromDate } },
        select: {
          ...reportBaseSelect,
        },
      });
    } catch (error) {
      if (!this.isMissingContactEmailColumnError(error)) throw error;
      this.logger.warn('contactEmail column missing in DB; retrying dashboard analytics without contactEmail');
      reports = await this.prisma.report.findMany({
        where: { createdAt: { gte: fromDate } },
        select: this.removeContactEmailFromSelect(reportBaseSelect),
      });
    }

    const categoryCount = this.groupBy(reports, 'category');
    const severityCount = this.groupBy(reports, 'severity');
    const statusCount = this.groupBy(reports, 'status');

    const criticalReports = reports.filter(
      (r:any) => r.severity === 'CRITICAL',
    ).length;
    const resolvedReports = reports.filter(
      (r:any) => r.status === 'RESOLVED',
    ).length;
    const resolutionRate =
      reports.length > 0
        ? ((resolvedReports / reports.length) * 100).toFixed(2)
        : 0;

    const flaggedReports = reports.filter(
      (r:any) => r.flaggedAsRepetitive || r.isDuplicate,
    ).length;

    return {
      summary: {
        totalReports: reports.length,
        criticalCases: criticalReports,
        resolutionRate: parseFloat(resolutionRate as string),
        flaggedReports,
        activeProfessionals: professionals.length,
        averageResponseTime: this.calculateAverageResponseTime(cases),
      },
      reportsByCategory: categoryCount,
      reportsBySeverity: severityCount,
      reportsByStatus: statusCount,
      recentReports: reports
        .sort((a:any, b:any) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10),
      riskyReports: reports
        .filter((r:any) => r.riskScore >= 50)
        .sort((a:any, b:any) => b.riskScore - a.riskScore)
        .slice(0, 5),
    };
  }

  /**
   * Get detailed incident analytics
   */
  async getIncidentAnalytics(days: number = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const incidentSelect: Prisma.ReportSelect = {
      ...reportBaseSelect,
      reporter: true,
    };

    let reports: any[] = [];
    try {
      reports = await this.prisma.report.findMany({
        where: { createdAt: { gte: fromDate } },
        select: incidentSelect,
      });
    } catch (error) {
      if (!this.isMissingContactEmailColumnError(error)) throw error;
      this.logger.warn('contactEmail column missing in DB; retrying incident analytics without contactEmail');
      reports = await this.prisma.report.findMany({
        where: { createdAt: { gte: fromDate } },
        select: this.removeContactEmailFromSelect(incidentSelect),
      });
    }

    const dailyTrend = this.getDailyTrend(reports, days);
    const categoryDistribution = this.groupBy(reports, 'category');
    const severityDistribution = this.groupBy(reports, 'severity');

    const anonymousCount = reports.filter((r:any) => r.isAnonymous).length;
    const reportedCount = reports.length - anonymousCount;

    const highRiskCount = reports.filter((r:any) => r.riskScore >= 70).length;
    const mediumRiskCount = reports.filter(
      (r:any) => r.riskScore >= 40 && r.riskScore < 70,
    ).length;
    const lowRiskCount = reports.filter((r:any) => r.riskScore < 40).length;

    return {
      period: { from: fromDate, to: new Date() },
      totalReports: reports.length,
      anonymousVsReported: {
        anonymous: anonymousCount,
        reported: reportedCount,
      },
      riskDistribution: {
        high: highRiskCount,
        medium: mediumRiskCount,
        low: lowRiskCount,
      },
      categoryDistribution,
      severityDistribution,
      dailyTrend,
      topReportingDays: this.getTopReportingDays(reports),
      languageDistribution: this.groupBy(reports, 'language'),
    };
  }

  /**
   * Get case management analytics
   */
  async getCaseManagementAnalytics(days: number = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const cases = await this.prisma.caseAssignment.findMany({
      where: { createdAt: { gte: fromDate } },
      include: {
        assignedTo: true,
        feedbacks: true,
      },
    });

    const casesByType = this.groupBy(cases, 'caseType');
    const casesByPriority = this.groupBy(cases, 'priority');
    const casesByStatus = this.groupBy(cases, 'status');

    const completedCases = cases.filter((c:any) => c.status === 'COMPLETED');
    const completionRate =
      cases.length > 0
        ? ((completedCases.length / cases.length) * 100).toFixed(2)
        : 0;

    const avgTimeToComplete = this.calculateAvgCompletionTime(completedCases);

    // Professional performance
    const professionalStats = this.getProfessionalStats(cases);

    return {
      summary: {
        totalCases: cases.length,
        completedCases: completedCases.length,
        completionRate: parseFloat(completionRate as string),
        averageTimeToComplete: avgTimeToComplete,
      },
      casesByType,
      casesByPriority,
      casesByStatus,
      professionalPerformance: professionalStats.slice(0, 10),
      feedback: {
        averageRating:
          cases.length > 0
            ? (
                cases.reduce((acc:any, c:any) => {
                  const ratings = c.feedbacks.map(
                    (f: { rating: number }) => f.rating,
                  );
                  const avg =
                    ratings.length > 0
                      ? ratings.reduce(
                          (a: number, b: number) => a + b,
                          0,
                        ) / ratings.length
                      : 0;
                  return acc + avg;
                }, 0) / cases.length
              ).toFixed(2)
            : 0,
        totalRatings: cases.reduce(
          (acc:any, c:any) => acc + c.feedbacks.length,
          0,
        ),
      },
    };
  }

  /**
   * Get professional directory analytics
   */
  async getProfessionalAnalytics() {
    const professionals = await this.prisma.serviceProvider.findMany({
      include: {
        reviews: true,
        assignedCases: true,
        supportCases: true,
      },
    });

    const byType = this.groupBy(professionals, 'type');

    const verified = professionals.filter((p:any) => p.isVerified).length;
    const unverified = professionals.length - verified;

    const avgRating =
      professionals.length > 0
        ? (
            professionals.reduce((acc:any, p:any) => acc + (p.rating || 0), 0) /
            professionals.length
          ).toFixed(2)
        : 0;

    const topRated = professionals
      .sort((a:any, b:any) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);

    const languageCount: Record<string, number> = {};
    professionals.forEach((p:any) => {
      p.languages.forEach((lang:any) => {
        languageCount[lang] = (languageCount[lang] || 0) + 1;
      });
    });

    return {
      total: professionals.length,
      verified,
      unverified,
      byType,
      averageRating: parseFloat(avgRating as string),
      topRated,
      languageSupport: languageCount,
    };
  }

  /**
   * Generate anonymized report for stakeholders
   */
  async generateAnonymizedReport(days: number = 30) {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    let reports: any[] = [];
    try {
      reports = await this.prisma.report.findMany({
        where: { createdAt: { gte: fromDate } },
        select: {
          ...reportBaseSelect,
        },
      });
    } catch (error) {
      if (!this.isMissingContactEmailColumnError(error)) throw error;
      this.logger.warn('contactEmail column missing in DB; retrying anonymized report without contactEmail');
      reports = await this.prisma.report.findMany({
        where: { createdAt: { gte: fromDate } },
        select: this.removeContactEmailFromSelect(reportBaseSelect),
      });
    }

    const cases = await this.prisma.caseAssignment.findMany({
      where: { createdAt: { gte: fromDate } },
    });

    // Create anonymized snapshot
    const snapshot = {
      date: new Date(),
      totalReports: reports.length,
      reportsByCategory: JSON.stringify(this.groupBy(reports, 'category')),
      reportsBySeverity: JSON.stringify(this.groupBy(reports, 'severity')),
      resolutionRate:
        reports.length > 0
          ? Number(
              (
                (reports.filter((r:any) => r.status === 'RESOLVED').length /
                  reports.length) *
                100
              ).toFixed(2),
            )
          : 0,
      averageResolutionTime: this.calculateAverageResponseTime(cases),
      anonymousReportCount: reports.filter((r:any) => r.isAnonymous).length,
      publicReportCount: reports.filter((r:any) => !r.isAnonymous).length,
      casesByType: JSON.stringify(this.groupBy(cases, 'caseType')),
      uniqueReporters: new Set(reports.map((r:any) => r.reporterId)).size,
    };

    await this.prisma.analyticsSnapshot.create({
      data: snapshot,
    });

    return snapshot;
  }

  /**
   * Get previously generated anonymized report snapshots
   */
  async getAnonymizedReportHistory(limit: number = 20) {
    const snapshots = await this.prisma.analyticsSnapshot.findMany({
      orderBy: { date: 'desc' },
      take: limit,
    });

    return snapshots.map((snapshot) => ({
      id: snapshot.id,
      generatedAt: snapshot.date,
      totalReports: snapshot.totalReports,
      resolutionRate: snapshot.resolutionRate,
      anonymousReportCount: snapshot.anonymousReportCount,
      publicReportCount: snapshot.publicReportCount,
      averageResolutionTime: snapshot.averageResolutionTime,
      uniqueReporters: snapshot.uniqueReporters,
      reportsByCategory: this.safeParseJson(snapshot.reportsByCategory),
      reportsBySeverity: this.safeParseJson(snapshot.reportsBySeverity),
      casesByType: this.safeParseJson(snapshot.casesByType),
    }));
  }

  /**
   * Get high-risk reports for intervention
   */
  async getHighRiskInterventionData() {
    const highRiskSelect: Prisma.ReportSelect = {
      ...reportBaseSelect,
      reporter: { select: { id: true, email: true } },
      caseAssignment: true,
    };

    let highRiskReports: any[] = [];
    try {
      highRiskReports = await this.prisma.report.findMany({
        where: {
          OR: [
            { severity: 'CRITICAL' },
            { riskScore: { gte: 80 } },
            { flaggedAsRepetitive: true },
          ],
        },
        select: highRiskSelect,
        orderBy: { riskScore: 'desc' },
        take: 50,
      });
    } catch (error) {
      if (!this.isMissingContactEmailColumnError(error)) throw error;
      this.logger.warn('contactEmail column missing in DB; retrying high-risk analytics without contactEmail');
      highRiskReports = await this.prisma.report.findMany({
        where: {
          OR: [
            { severity: 'CRITICAL' },
            { riskScore: { gte: 80 } },
            { flaggedAsRepetitive: true },
          ],
        },
        select: this.removeContactEmailFromSelect(highRiskSelect),
        orderBy: { riskScore: 'desc' },
        take: 50,
      });
    }

    return {
      criticalCaseCount: highRiskReports.length,
      reports: highRiskReports,
      recommendations: this.generateInterventionRecommendations(highRiskReports),
    };
  }

  /**
   * Helper: Group array by property
   */
  private groupBy(array: any[], property: string): Record<string, number> {
    return array.reduce(
      (acc, item) => {
        const key = item[property];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }

  /**
   * Helper: Get daily trend
   */
  private getDailyTrend(reports: any[], days: number) {
    const trend: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trend[dateStr] = 0;
    }

    reports.forEach((report) => {
      const dateStr = report.createdAt.toISOString().split('T')[0];
      if (trend[dateStr] !== undefined) {
        trend[dateStr]++;
      }
    });

    return trend;
  }

  /**
   * Helper: Get top reporting days
   */
  private getTopReportingDays(reports: any[]) {
    const dayCount: Record<string, number> = {};

    reports.forEach((report) => {
      const day = report.createdAt.toISOString().split('T')[0];
      dayCount[day] = (dayCount[day] || 0) + 1;
    });

    return Object.entries(dayCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7)
      .map(([day, count]) => ({ day, count }));
  }

  /**
   * Helper: Calculate average completion time
   */
  private calculateAvgCompletionTime(cases: any[]): number {
    if (cases.length === 0) return 0;

    const times = cases.map((c) => {
      const start = new Date(c.createdAt).getTime();
      const end = new Date(c.completedAt || new Date()).getTime();
      return (end - start) / (1000 * 60 * 60 * 24); // Days
    });

    return Math.round(
      times.reduce((a, b) => a + b, 0) / times.length,
    );
  }

  /**
   * Helper: Calculate average response time
   */
  private calculateAverageResponseTime(cases: any[]): number {
    if (cases.length === 0) return 0;

    const times = cases.map((c) => {
      const start = new Date(c.createdAt).getTime();
      const end = new Date(c.dueDate || new Date()).getTime();
      return (end - start) / (1000 * 60 * 60 * 24); // Days
    });

    return Math.round(
      times.reduce((a, b) => a + b, 0) / times.length,
    );
  }

  /**
   * Helper: Get professional stats
   */
  private getProfessionalStats(cases: any[]) {
    const stats: Record<string, any> = {};

    cases.forEach((caseItem) => {
      const profId = caseItem.assignedToId;
      if (!stats[profId]) {
        stats[profId] = {
          id: profId,
          name: caseItem.assignedTo.name,
          totalCases: 0,
          completedCases: 0,
          averageRating: 0,
        };
      }

      stats[profId].totalCases++;
      if (caseItem.status === 'COMPLETED') {
        stats[profId].completedCases++;
      }

      if (caseItem.feedbacks.length > 0) {
        const ratings = caseItem.feedbacks.map((f: { rating: number }) => f.rating);
        stats[profId].averageRating =
          ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
      }
    });

    return Object.values(stats)
      .sort((a, b) => b.completedCases - a.completedCases);
  }

  /**
   * Helper: Generate intervention recommendations
   */
  private generateInterventionRecommendations(reports: any[]) {
    const recommendations = [];

    const urgentReports = reports.filter((r) => r.severity === 'CRITICAL');
    if (urgentReports.length > 0) {
      recommendations.push({
        priority: 'URGENT',
        action: `${urgentReports.length} critical cases require immediate intervention`,
        targetGroup: 'Case Managers',
      });
    }

    const flaggedReports = reports.filter(
      (r) => r.flaggedAsRepetitive || r.isDuplicate,
    );
    if (flaggedReports.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: `${flaggedReports.length} reports flagged for duplicate/fraud review`,
        targetGroup: 'Compliance Team',
      });
    }

    const unassignedReports = reports.filter((r) => !r.caseAssignment);
    if (unassignedReports.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: `${unassignedReports.length} reports awaiting case assignment`,
        targetGroup: 'Case Assignment Team',
      });
    }

    return recommendations;
  }

  private safeParseJson(value: string) {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  /**
   * Get medical provider dashboard analytics
   */
  async getMedicalProviderDashboard() {
    // Total patients: users with role SURVIVOR
    const totalPatients = await this.prisma.user.count({
      where: { role: 'SURVIVOR' },
    });

    // Active cases: caseAssignments with status not COMPLETED
    const activeCases = await this.prisma.caseAssignment.count({
      where: {
        status: {
          notIn: ['COMPLETED'],
        },
      },
    });

    // Pending exams: reports with status PENDING_REVIEW
    const pendingExams = await this.prisma.report.count({
      where: { status: 'PENDING_REVIEW' },
    });

    // Today's appointments: caseAssignments created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await this.prisma.caseAssignment.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Recent patients: recent caseAssignments with user info
    const recentPatients = await this.prisma.caseAssignment.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        report: {
          include: {
            reporter: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    // Upcoming appointments: today's caseAssignments
    const upcomingAppointments = await this.prisma.caseAssignment.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      take: 3,
      include: {
        report: {
          include: {
            reporter: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    return {
      stats: {
        totalPatients,
        activeCases,
        pendingExams,
        todayAppointments,
      },
      recentPatients: recentPatients.map((ca) => ({
        id: ca.id,
        name: `${ca.report?.reporter?.firstName || 'Unknown'} ${ca.report?.reporter?.lastName || ''}`.trim(),
        lastVisit: ca.createdAt.toISOString().split('T')[0],
        status: ca.status.toLowerCase(),
        priority: ca.priority.toLowerCase(),
      })),
      upcomingAppointments: upcomingAppointments.map((ca) => ({
        id: ca.id,
        patient: `${ca.report?.reporter?.firstName || 'Unknown'} ${ca.report?.reporter?.lastName || ''}`.trim(),
        time: ca.createdAt.toTimeString().slice(0, 5), // HH:MM
        type: ca.caseType,
      })),
    };
  }
}
