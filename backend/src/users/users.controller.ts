import {
  Controller,
  Get,
  Patch,
  Delete,
  UseGuards,
  Request,
  Body,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Get current authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.id);
  }

  /**
   * GET /users/:id
   * Get any user by ID (public or guarded depending on your choice)
   */
  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * PATCH /users/me
   * Update current user profile (bio, avatar)
   */
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(req.user.id, updateUserDto);
  }

  /**
   * GET /users/me/stats
   * Get current user statistics
   */
  @UseGuards(JwtAuthGuard)
  @Get('me/stats')
  getUserStats(@Request() req) {
    return this.usersService.getUserStats(req.user.id);
  }

  /**
   * DELETE /users/me
   * Delete current user account
   */
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  deleteAccount(@Request() req) {
    return this.usersService.delete(req.user.id);
  }
}
