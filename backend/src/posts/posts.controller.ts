import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@Controller('posts')
export class PostsController
{
    constructor(private postsService: PostsService) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a post' })
    @ApiResponse({ status: 201, description: 'Post created successfully' })
    async createPost(@Request() req, @Body() dto: CreatePostDto)
    {
        return this.postsService.create(req.user.id, dto);
    }

    @Get('feed')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get feed posts (public + followed users followers-only posts)' })
    @ApiResponse({ status: 200, description: 'Feed fetched successfully' })
    async getFeed(@Request() req)
    {
        return this.postsService.getFeed(req.user.id);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get post by id' })
    @ApiParam({ name: 'id', description: 'post id (cuid)' })
    @ApiResponse({ status: 200, description: 'Post fetched successfully' })
    @ApiResponse({ status: 404, description: 'Post not found' })
    async getPostById(@Param('id') postId: string, @Request() req)
    {
        return this.postsService.getPostByIdForViewer(postId, req.user.id);
    }

    @Post(':id/reactions')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'React to post' })
    @ApiParam({ name: 'id', description: 'post id (cuid)' })
    @ApiResponse({ status: 201, description: 'Reaction added successfully' })
    async reactToPost(
        @Param('id') postId: string,
        @Request() req,
        @Body() dto: CreateReactionDto,
    )
    {
        return this.postsService.react(postId, req.user.id, dto);
    }

    @Post(':id/comments')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Comment on post' })
    @ApiParam({ name: 'id', description: 'post id (cuid)' })
    @ApiResponse({ status: 201, description: 'Comment added successfully' })
    async commentOnPost(
        @Param('id') postId: string,
        @Request() req,
        @Body() dto: CreateCommentDto,
    )
    {
        return this.postsService.comment(postId, req.user.id, dto);
    }
}
