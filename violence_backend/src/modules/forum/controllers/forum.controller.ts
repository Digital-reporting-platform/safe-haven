import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ForumService } from '../services/forum.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('forum')
@Controller('forum')
export class ForumController {
  constructor(private forumService: ForumService) {}

  @Post('posts')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create forum post' })
  createPost(@Request() req: any, @Body() dto: { title: string; content: string; category: string; isAnonymous?: boolean }) {
    return this.forumService.createPost(req.user.sub, dto);
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get all published posts' })
  getPosts(@Query('category') category?: string) {
    return this.forumService.getPosts(category);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get post by ID' })
  getPostById(@Param('id') id: string) {
    return this.forumService.getPostById(id);
  }

  @Post('posts/:id/comments')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add comment to post' })
  addComment(@Param('id') postId: string, @Request() req: any, @Body('content') content: string) {
    return this.forumService.addComment(postId, req.user.sub, content);
  }

  @Post('posts/:id/like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Like a post' })
  likePost(@Param('id') id: string) {
    return this.forumService.likePost(id);
  }

  @Delete('posts/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete own post' })
  deletePost(@Param('id') id: string, @Request() req: any) {
    return this.forumService.deletePost(id, req.user.sub);
  }
}
