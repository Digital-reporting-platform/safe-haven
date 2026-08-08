import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class ForumService {
  private readonly logger = new Logger(ForumService.name);

  constructor(private prisma: PrismaService) {}

  async createPost(authorId: string, dto: { title: string; content: string; category: string; isAnonymous?: boolean }) {
    const post = await this.prisma.forumPost.create({
      data: {
        authorId,
        title: dto.title,
        content: dto.content,
        category: dto.category as any,
        isAnonymous: dto.isAnonymous ?? true,
        status: 'PENDING_MODERATION',
      },
      include: { author: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
    this.logger.log(`Forum post created: ${post.id}`);
    return post;
  }

  async getPosts(category?: string, status = 'PUBLISHED') {
    return this.prisma.forumPost.findMany({
      where: {
        ...(category && { category: category as any }),
        status: status as any,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPostById(id: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        comments: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    
    await this.prisma.forumPost.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
    
    return post;
  }

  async addComment(postId: string, authorId: string, content: string) {
    const post = await this.prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    
    return this.prisma.forumComment.create({
      data: { postId, content },
      include: { post: true },
    });
  }

  async likePost(postId: string) {
    return this.prisma.forumPost.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    });
  }

  async deletePost(id: string, userId: string) {
    const post = await this.prisma.forumPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new BadRequestException('Not authorized');
    
    return this.prisma.forumPost.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DELETED' },
    });
  }
}
