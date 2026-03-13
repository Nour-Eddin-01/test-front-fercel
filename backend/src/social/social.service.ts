import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SocialService
{
    private readonly logger = new Logger(SocialService.name);

    constructor(private prisma: PrismaService) {}

    async follow(currentUserId: string, targetUserId: string)
    {
        this.logger.log(`Follow request: ${currentUserId} -> ${targetUserId}`);
        try
        {
            if (currentUserId === targetUserId)
            {
                this.logger.warn(`Follow failed: cannot follow self, userId ${currentUserId}`);
                throw new HttpException('You cannot follow yourself', HttpStatus.BAD_REQUEST);
            }

            const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
            if (!targetUser)
            {
                this.logger.warn(`Follow failed: target user not found, targetUserId ${targetUserId}`);
                throw new HttpException('Target user not found', HttpStatus.NOT_FOUND);
            }

            const alreadyFollowing = await this.prisma.follow.findUnique(
                {
                    where:
                    {
                        followerId_followingId:
                        {
                            followerId: currentUserId,
                            followingId: targetUserId,
                        },
                    },
                }
            );

            if (alreadyFollowing)
            {
                this.logger.warn(`Follow failed: already following, ${currentUserId} -> ${targetUserId}`);
                throw new HttpException('You are already following this user', HttpStatus.BAD_REQUEST);
            }

            const follow = await this.prisma.follow.create(
                {
                    data:
                    {
                        followerId: currentUserId,
                        followingId: targetUserId,
                    },
                }
            );

            this.logger.log(`User ${currentUserId} followed ${targetUserId} successfully`);
            return {
                message: 'Followed user successfully',
                follow,
            };
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;

            this.logger.error(`Failed to follow user, ${currentUserId} -> ${targetUserId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException('Failed to follow user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async unfollow(currentUserId: string, targetUserId: string)
    {
        this.logger.log(`Unfollow request: ${currentUserId} -> ${targetUserId}`);
        try
        {
            const existing = await this.prisma.follow.findUnique(
                {
                    where:
                    {
                        followerId_followingId:
                        {
                            followerId: currentUserId,
                            followingId: targetUserId,
                        },
                    },
                }
            );

            if (!existing)
            {
                this.logger.warn(`Unfollow failed: follow relation not found, ${currentUserId} -> ${targetUserId}`);
                throw new HttpException('Follow relation not found', HttpStatus.NOT_FOUND);
            }

            await this.prisma.follow.delete(
                {
                    where: { id: existing.id },
                }
            );

            this.logger.log(`User ${currentUserId} unfollowed ${targetUserId} successfully`);
            return { message: 'Unfollowed user successfully' };
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;

            this.logger.error(`Failed to unfollow user, ${currentUserId} -> ${targetUserId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException('Failed to unfollow user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getFollowers(userId: string)
    {
        this.logger.log(`Fetching followers for user ${userId}`);
        try
        {
            const result = await this.prisma.follow.findMany(
                {
                    where: { followingId: userId },
                    include:
                    {
                        follower:
                        {
                            select:
                            {
                                id: true,
                                username: true,
                                avatarUrl: true,
                                skillLevel: true,
                                level: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                }
            );
            this.logger.log(`Fetched ${result.length} followers for user ${userId}`);
            return result;
        }
        catch (error)
        {
            this.logger.error(`Failed to fetch followers for user ${userId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException('Failed to fetch followers', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getFollowing(userId: string)
    {
        this.logger.log(`Fetching following for user ${userId}`);
        try
        {
            const result = await this.prisma.follow.findMany(
                {
                    where: { followerId: userId },
                    include:
                    {
                        following:
                        {
                            select:
                            {
                                id: true,
                                username: true,
                                avatarUrl: true,
                                skillLevel: true,
                                level: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                }
            );
            this.logger.log(`Fetched ${result.length} following for user ${userId}`);
            return result;
        }
        catch (error)
        {
            this.logger.error(`Failed to fetch following for user ${userId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException('Failed to fetch following users', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async friendRequest(currentUserId: string, targetUserId: string)
    {
        this.logger.log(`Friend request: ${currentUserId} -> ${targetUserId}`);
        try
        {
            if (currentUserId === targetUserId)
            {
                this.logger.warn(`Friend request failed: cannot send to self, userId ${currentUserId}`);
                throw new HttpException('You cannot send friend request to yourself', HttpStatus.BAD_REQUEST);
            }

            const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
            if (!targetUser)
            {
                this.logger.warn(`Friend request failed: target user not found, targetUserId ${targetUserId}`);
                throw new HttpException('Target user not found', HttpStatus.NOT_FOUND);
            }

            const existingDirect = await this.prisma.friend.findUnique(
                {
                    where:
                    {
                        initiatorId_receiverId:
                        {
                            initiatorId: currentUserId,
                            receiverId: targetUserId,
                        },
                    },
                }
            );

            const existingReverse = await this.prisma.friend.findUnique(
                {
                    where:
                    {
                        initiatorId_receiverId:
                        {
                            initiatorId: targetUserId,
                            receiverId: currentUserId,
                        },
                    },
                }
            );

            if (existingDirect?.status === 'pending')
            {
                this.logger.warn(`Friend request failed: already sent, ${currentUserId} -> ${targetUserId}`);
                throw new HttpException('Friend request already sent', HttpStatus.BAD_REQUEST);
            }

            if (existingDirect?.status === 'accepted' || existingReverse?.status === 'accepted')
            {
                this.logger.warn(`Friend request failed: already friends, ${currentUserId} -> ${targetUserId}`);
                throw new HttpException('You are already friends', HttpStatus.BAD_REQUEST);
            }

            if (existingReverse?.status === 'pending')
            {
                this.logger.warn(`Friend request failed: reverse request pending, ${currentUserId} -> ${targetUserId}`);
                throw new HttpException('This user already sent you a request, accept it instead', HttpStatus.BAD_REQUEST);
            }

            const relation = await this.prisma.friend.create(
                {
                    data:
                    {
                        initiatorId: currentUserId,
                        receiverId: targetUserId,
                        status: 'pending',
                    },
                }
            );

            this.logger.log(`Friend request sent successfully, ${currentUserId} -> ${targetUserId}`);
            return {
                message: 'Friend request sent successfully',
                relation,
            };
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;

            this.logger.error(`Failed to send friend request, ${currentUserId} -> ${targetUserId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException('Failed to send friend request', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async accept(currentUserId: string, initiatorUserId: string)
    {
        this.logger.log(`Accept friend request: currentUser ${currentUserId}, initiator ${initiatorUserId}`);
        try
        {
            const friendRequest = await this.prisma.friend.findFirst(
                {
                    where:
                    {
                        initiatorId: initiatorUserId,
                        receiverId: currentUserId,
                        status: 'pending',
                    },
                }
            );

            if (!friendRequest)
            {
                this.logger.warn(`Accept failed: friend request not found, currentUser ${currentUserId}, initiator ${initiatorUserId}`);
                throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND);
            }

            const updated = await this.prisma.friend.update(
                {
                    where: { id: friendRequest.id },
                    data: { status: 'accepted' },
                }
            );

            this.logger.log(`Friend request accepted, currentUser ${currentUserId}, initiator ${initiatorUserId}`);
            return {
                message: 'Friend request accepted',
                relation: updated,
            };
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;

            this.logger.error(`Failed to accept friend request, currentUser ${currentUserId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException('Failed to accept friend request', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async reject(currentUserId: string, initiatorUserId: string)
    {
        this.logger.log(`Reject friend request: currentUser ${currentUserId}, initiator ${initiatorUserId}`);
        try
        {
            const friendRequest = await this.prisma.friend.findFirst(
                {
                    where:
                    {
                        initiatorId: initiatorUserId,
                        receiverId: currentUserId,
                        status: 'pending',
                    },
                }
            );

            if (!friendRequest)
            {
                this.logger.warn(`Reject failed: friend request not found, currentUser ${currentUserId}, initiator ${initiatorUserId}`);
                throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND);
            }

            const updated = await this.prisma.friend.update(
                {
                    where: { id: friendRequest.id },
                    data: { status: 'blocked' },
                }
            );

            this.logger.log(`Friend request rejected, currentUser ${currentUserId}, initiator ${initiatorUserId}`);
            return {
                message: 'Friend request rejected',
                relation: updated,
            };
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;

            this.logger.error(`Failed to reject friend request, currentUser ${currentUserId}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException('Failed to reject friend request', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
