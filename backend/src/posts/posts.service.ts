import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';

@Injectable()
export class PostsService
{
    private readonly logger = new Logger(PostsService.name);

    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreatePostDto)
    {
        this.logger.log(`Creating post for user ${userId}`);
        try
        {
            const hasContent = Boolean(dto.text || dto.imageUrl || dto.linkUrl || dto.stockId);
            if (!hasContent)
            {
                this.logger.warn('Create post failed: post must contain at least one content field');
                throw new HttpException('Post must contain at least one content field', HttpStatus.BAD_REQUEST);
            }

            if (dto.stockId)
            {
                const stock = await this.prisma.stock.findUnique({ where: { id: dto.stockId } });
                if (!stock)
                {
                    this.logger.warn(`Create post failed: stock not found, stockId ${dto.stockId}`);
                    throw new HttpException('Stock not found', HttpStatus.NOT_FOUND);
                }
            }

            const created = await this.prisma.post.create(
                {
                    data:
                    {
                        authorId: userId,
                        text: dto.text,
                        imageUrl: dto.imageUrl,
                        linkUrl: dto.linkUrl,
                        stockId: dto.stockId,
                        visibility: dto.visibility ?? 'public',
                    },
                    include:
                    {
                        author:
                        {
                            select:
                            {
                                id: true,
                                username: true,
                                avatarUrl: true,
                            },
                        },
                        stock:
                        {
                            select:
                            {
                                id: true,
                                isin: true,
                                name: true,
                            },
                        },
                    },
                }
            );
            this.logger.log( { post_successful: ''} );
            this.logger.log(`Post created successfully for user ${userId}, postId ${created.id}`);
            return created;
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;

            this.logger.error(`Failed to create post for user ${userId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to create post',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getFeed(userId: string)
    {
        this.logger.log(`Fetching feed for user ${userId}`);
        try
        {
            const following = await this.prisma.follow.findMany(
                {
                    where: { followerId: userId },
                    select: { followingId: true },
                }
            );

            const followingIds = following.map((f) => f.followingId);

            const feedPosts = await this.prisma.post.findMany(
                {
                    where:
                    {
                        OR:
                        [
                            { visibility: 'public' },
                            {
                                visibility: 'followers',
                                authorId:
                                {
                                    in: [userId, ...followingIds],
                                },
                            },
                        ],
                    },
                    include:
                    {
                        author:
                        {
                            select:
                            {
                                id: true,
                                username: true,
                                avatarUrl: true,
                            },
                        },
                        stock:
                        {
                            select:
                            {
                                id: true,
                                isin: true,
                                name: true,
                            },
                        },
                        comments:
                        {
                            include:
                            {
                                author:
                                {
                                    select:
                                    {
                                        id: true,
                                        username: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                            orderBy: { createdAt: 'desc' },
                            take: 3,
                        },
                        reactions: true,
                        _count:
                        {
                            select:
                            {
                                comments: true,
                                reactions: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                }
            );

            this.logger.log(`Fetched ${feedPosts.length} posts for user ${userId}`);
            return feedPosts;
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;

            this.logger.error(`Failed to fetch feed for user ${userId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to fetch feed',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getPostById(postId: string)
    {
        this.logger.log(`Fetching post ${postId}`);
        try
        {
            const post = await this.prisma.post.findUnique(
                {
                    where: { id: postId },
                    include:
                    {
                        author:
                        {
                            select:
                            {
                                id: true,
                                username: true,
                                avatarUrl: true,
                            },
                        },
                        stock:
                        {
                            select:
                            {
                                id: true,
                                isin: true,
                                name: true,
                            },
                        },
                        comments:
                        {
                            include:
                            {
                                author:
                                {
                                    select:
                                    {
                                        id: true,
                                        username: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                            orderBy: { createdAt: 'asc' },
                        },
                        reactions: true,
                        _count:
                        {
                            select:
                            {
                                comments: true,
                                reactions: true,
                            },
                        },
                    },
                }
            );

            if (!post)
            {
                this.logger.warn(`Post not found, postId ${postId}`);
                throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
            }

            return post;
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;

            this.logger.error(`Failed to fetch post ${postId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to fetch post',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getPostByIdForViewer(postId: string, viewerId: string)
    {
        this.logger.log(`Fetching post ${postId} for viewer ${viewerId}`);
        try
        {
            const post = await this.getPostById(postId);

            if (post.visibility === 'followers' && post.authorId !== viewerId)
            {
                const follow = await this.prisma.follow.findUnique(
                    {
                        where:
                        {
                            followerId_followingId:
                            {
                                followerId: viewerId,
                                followingId: post.authorId,
                            },
                        },
                    }
                );

                if (!follow)
                {
                    this.logger.warn(`Post ${postId} forbidden for viewer ${viewerId}`);
                    throw new HttpException('You are not allowed to view this post', HttpStatus.FORBIDDEN);
                }
            }

            return post;
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;

            this.logger.error(`Failed to fetch post ${postId} for viewer ${viewerId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to fetch post',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async react(postId: string, userId: string, dto: CreateReactionDto)
    {
        this.logger.log(`React to post ${postId} by user ${userId}, type ${dto.type}`);
        try
        {
            const post = await this.prisma.post.findUnique({ where: { id: postId } });
            if (!post)
            {
                this.logger.warn(`React failed: post not found, postId ${postId}`);
                throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
            }

            const existingReaction = await this.prisma.postReaction.findUnique(
                {
                    where:
                    {
                        postId_userId_type:
                        {
                            postId,
                            userId,
                            type: dto.type,
                        },
                    },
                }
            );

            if (existingReaction)
            {
                this.logger.warn(`React failed: reaction already exists for post ${postId}, user ${userId}`);
                throw new HttpException('Reaction already exists for this type', HttpStatus.BAD_REQUEST);
            }

            const reaction = await this.prisma.postReaction.create(
                {
                    data:
                    {
                        postId,
                        userId,
                        type: dto.type,
                    },
                }
            );

            this.logger.log(`Reaction added successfully for post ${postId} by user ${userId}`);
            return {
                message: 'Reaction added successfully',
                reaction,
            };
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;

            this.logger.error(`Failed to react to post ${postId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to react to post',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async comment(postId: string, userId: string, dto: CreateCommentDto)
    {
        this.logger.log(`Comment on post ${postId} by user ${userId}`);
        try
        {
            const post = await this.prisma.post.findUnique({ where: { id: postId } });
            if (!post)
            {
                this.logger.warn(`Comment failed: post not found, postId ${postId}`);
                throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
            }

            const comment = await this.prisma.postComment.create(
                {
                    data:
                    {
                        postId,
                        authorId: userId,
                        content: dto.content,
                    },
                    include:
                    {
                        author:
                        {
                            select:
                            {
                                id: true,
                                username: true,
                                avatarUrl: true,
                            },
                        },
                    },
                }
            );

            this.logger.log(`Comment added successfully for post ${postId} by user ${userId}`);
            return {
                message: 'Comment added successfully',
                comment,
            };
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;

            this.logger.error(`Failed to comment on post ${postId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException(
                'Failed to comment on post',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
