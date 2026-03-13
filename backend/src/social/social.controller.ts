import { Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SocialService } from './social.service';

@ApiTags('social')
@Controller('social')
export class SocialController
{
    constructor(private socialService: SocialService) {}

    @Post('follow/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Follow a user' })
    @ApiParam({ name: 'userId', description: 'target user id (cuid)' })
    @ApiResponse({ status: 201, description: 'Followed user successfully' })
    async follow(@Request() req, @Param('userId') userId: string)
    {
        return this.socialService.follow(req.user.id, userId);
    }

    @Delete('unfollow/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Unfollow a user' })
    @ApiParam({ name: 'userId', description: 'target user id (cuid)' })
    @ApiResponse({ status: 200, description: 'Unfollowed user successfully' })
    async unfollow(@Request() req, @Param('userId') userId: string)
    {
        return this.socialService.unfollow(req.user.id, userId);
    }

    @Get('followers')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current user followers' })
    @ApiResponse({ status: 200, description: 'Followers list' })
    async getFollowers(@Request() req)
    {
        return this.socialService.getFollowers(req.user.id);
    }

    @Get('following')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get current user following list' })
    @ApiResponse({ status: 200, description: 'Following list' })
    async getFollowing(@Request() req)
    {
        return this.socialService.getFollowing(req.user.id);
    }

    @Post('friend-request/:userId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Send friend request to user' })
    @ApiParam({ name: 'userId', description: 'target user id (cuid)' })
    @ApiResponse({ status: 201, description: 'Friend request sent successfully' })
    async friendRequest(@Request() req, @Param('userId') userId: string)
    {
        return this.socialService.friendRequest(req.user.id, userId);
    }

    @Patch('friend-request/:userId/accept')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Accept friend request from user' })
    @ApiParam({ name: 'userId', description: 'initiator user id (cuid)' })
    @ApiResponse({ status: 200, description: 'Friend request accepted' })
    async acceptFriendRequest(@Request() req, @Param('userId') userId: string)
    {
        return this.socialService.accept(req.user.id, userId);
    }

    @Patch('friend-request/:userId/reject')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Reject friend request from user' })
    @ApiParam({ name: 'userId', description: 'initiator user id (cuid)' })
    @ApiResponse({ status: 200, description: 'Friend request rejected' })
    async rejectFriendRequest(@Request() req, @Param('userId') userId: string)
    {
        return this.socialService.reject(req.user.id, userId);
    }
}
