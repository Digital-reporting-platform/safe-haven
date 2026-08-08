import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ForumPostStatus, UserStatus } from '@prisma/client';
import {
  ModerateAction,
} from '../dto/moderate-content.dto';
import { UpdateModeratorProfileDto } from '../dto/update-moderator-profile.dto';

type ModeratorExtraProfile = {
  bio?: string;
};

@Injectable()
export class ModeratorWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  private parseExtraProfile(description?: string | null): ModeratorExtraProfile {
    if (!description) return {};
    try {
      const parsed = JSON.parse(description);
      if (parsed && typeof parsed === 'object') return parsed as ModeratorExtraProfile;
      return {};
    } catch {
      return { bio: description };
    }
  }

  async getDashboard() {
    const [
      pendingReviews,
      activeFlags,
      totalUsers,
      forumPosts,
      recentPendingPosts,
    ] = await Promise.all([
      this.prisma.forumPost.count({ where: { status: ForumPostStatus.PENDING_MODERATION } }),
      this.prisma.report.count({
        where: {
          OR: [{ flaggedAsRepetitive: true }, { riskScore: { gte: 70 } }],
          status: { notIn: ['RESOLVED', 'CLOSED'] as any },
        },
      }),
      this.prisma.user.count({ where: { status: { not: UserStatus.DELETED } } }),
      this.prisma.forumPost.count({ where: { status: ForumPostStatus.PUBLISHED } }),
      this.prisma.forumPost.findMany({
        where: { status: ForumPostStatus.PENDING_MODERATION },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          title: true,
          createdAt: true,
          category: true,
          author: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      }),
    ]);

    return {
      stats: {
        pendingReviews,
        activeFlags,
        totalUsers,
        forumPosts,
      },
      recentActivities: recentPendingPosts.map((post) => ({
        id: post.id,
        type: 'report',
        message: `Pending post: ${post.title}`,
        time: post.createdAt.toISOString(),
        priority: 'medium',
        author:
          `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() ||
          post.author?.email ||
          'Unknown',
      })),
    };
  }

  async getContentQueue(priority?: string) {
    const posts = await this.prisma.forumPost.findMany({
      where: {
        status: {
          in: [
            ForumPostStatus.PENDING_MODERATION,
            ForumPostStatus.PUBLISHED,
            ForumPostStatus.HIDDEN,
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        author: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    const mapped = posts.map((post) => {
      const computedPriority =
        post.status === ForumPostStatus.PENDING_MODERATION
          ? 'high'
          : post.status === ForumPostStatus.HIDDEN
            ? 'medium'
            : 'low';

      return {
        id: post.id,
        contentType: 'Forum Post',
        title: post.title,
        author:
          `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.trim() ||
          post.author?.email ||
          'Unknown',
        submittedDate: post.createdAt.toISOString().split('T')[0],
        priority: computedPriority,
        status:
          post.status === ForumPostStatus.PENDING_MODERATION
            ? 'pending'
            : post.status === ForumPostStatus.PUBLISHED
              ? 'approved'
              : 'rejected',
        reason: `Category: ${post.category}`,
      };
    });

    if (!priority || priority === 'all') return mapped;
    return mapped.filter((x) => x.priority === priority);
  }

  async moderateContent(postId: string, action: ModerateAction) {
    const existing = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!existing) throw new BadRequestException('Content not found');

    const statusMap: Record<ModerateAction, ForumPostStatus> = {
      [ModerateAction.APPROVE]: ForumPostStatus.PUBLISHED,
      [ModerateAction.REJECT]: ForumPostStatus.DELETED,
      [ModerateAction.HIDE]: ForumPostStatus.HIDDEN,
    };

    return this.prisma.forumPost.update({
      where: { id: postId },
      data: { status: statusMap[action] },
      select: { id: true, status: true, updatedAt: true },
    });
  }

  async getUsers(search?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        status: { not: UserStatus.DELETED },
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 300,
    });

    return users.map((user) => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      email: user.email,
      role: user.role,
      status: user.status,
      flags: 0,
      lastActive: user.updatedAt.toISOString().split('T')[0],
    }));
  }

  async updateUserStatus(userId: string, status: UserStatus) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new BadRequestException('User not found');
    if (user.role === 'ADMIN') {
      throw new BadRequestException('Moderator cannot change admin status');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, status: true, updatedAt: true },
    });
  }

  async getAnalytics() {
    const [reports, forum, users] = await Promise.all([
      this.prisma.report.count(),
      this.prisma.forumPost.groupBy({ by: ['status'], _count: true }),
      this.prisma.user.groupBy({ by: ['status'], _count: true }),
    ]);

    return {
      totalModerated: reports,
      forumByStatus: forum.map((x) => ({ status: x.status, count: x._count })),
      usersByStatus: users.map((x) => ({ status: x.status, count: x._count })),
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });
    if (!user) throw new BadRequestException('User not found');

    const provider = await this.prisma.serviceProvider.findFirst({
      where: { email: user.email },
      select: { description: true },
      orderBy: { updatedAt: 'desc' },
    });

    const extra = this.parseExtraProfile(provider?.description);

    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phone: user.phone || '',
      bio: extra.bio || '',
      role: 'MODERATOR',
      language: 'ENG',
      timezone: 'UTC+3',
    };
  }

  async updateProfile(userId: string, dto: UpdateModeratorProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, phone: true },
    });
    if (!user) throw new BadRequestException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
    });

    const existingProvider = await this.prisma.serviceProvider.findFirst({
      where: { email: user.email },
      select: { id: true, description: true },
      orderBy: { updatedAt: 'desc' },
    });

    const extra = this.parseExtraProfile(existingProvider?.description);
    const mergedExtra = {
      ...extra,
      ...(dto.bio !== undefined && { bio: dto.bio }),
    };

    if (existingProvider) {
      await this.prisma.serviceProvider.update({
        where: { id: existingProvider.id },
        data: { description: JSON.stringify(mergedExtra) },
      });
    }

    return this.getProfile(userId);
  }
}
