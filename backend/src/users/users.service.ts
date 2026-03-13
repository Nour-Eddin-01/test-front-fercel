import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService
{
    private readonly logger = new Logger(UsersService.name);

    constructor
    (
        private prisma:     PrismaService,
    ) {}

    // find by id
    async   findOne(id: string)
    {
        this.logger.log(`Fetching user by id ${id}`);
        try
        {
            const   existingUser = await this.prisma.user.findUnique(
                {
                    where:
                    {
                        id, 
                    },
                    select:
                    {
                        id:           true,
                        email:        true,
                        username:     true,
                        level:        true,
                        skillLevel:   true,
                        xp:           true,
                        totalBalance: true,
                        createdAt:    true,
                        portfolio:
                        {
                            select:
                            {
                                id:          true,
                                totalValue:  true,
                                cashBalance: true,
                            }
                            
                        },
                    },
                }
            );
            if (!existingUser)
            {
                this.logger.warn(`User not found, id ${id}`);
                throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
            }

            return existingUser;
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;
            this.logger.error(`Failed to fetch user by id ${id}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException( 'Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR,);
        }
    }

    // find by email
    async   findByEmail(email:  string)
    {
        this.logger.log('Fetching user by email');
        try
        {
            const   existingUser =  await   this.prisma.user.findUnique(
                {
                        where:
                        {
                            email, 
                        },
                        select:
                        {
                            id:           true,
                            username:     true,
                            level:        true,
                            skillLevel:   true,
                            xp:           true,
                            totalBalance: true,
                            createdAt:    true,
                            portfolio:
                            {
                                select:
                                {
                                    id:          true,
                                    totalValue:  true,
                                    cashBalance: true,
                                }

                            },
                        },
                    }
            );

            if (!existingUser)
            {
                this.logger.warn('User not found by email');
                throw new HttpException('User Not Found', HttpStatus.NOT_FOUND,);
            }

            return existingUser;
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;
            this.logger.error('Failed to fetch user by email', error instanceof Error ? error.stack : undefined);
            throw new HttpException( 'Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR,);
        }

    }

    // find by userame
    async   findByUsername(username: string)
    {
        this.logger.log(`Fetching user by username ${username}`);
        try
        {
            const   existingUser =  await   this.prisma.user.findUnique(
                {
                        where:
                        {
                            username, 
                        },
                        select:
                        {
                            id:           true,
                            level:        true,
                            skillLevel:   true,
                            xp:           true,
                            totalBalance: true,
                            createdAt:    true,
                            portfolio:
                            {
                                select:
                                {
                                    id:          true,
                                    totalValue:  true,
                                    cashBalance: true,
                                }

                            },
                        },
                    }
            );

            if (!existingUser)
            {
                this.logger.warn(`User not found by username ${username}`);
                throw new HttpException('User Not Found', HttpStatus.NOT_FOUND,);
            }

            return existingUser;
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw error;
            this.logger.error(`Failed to fetch user by username ${username}`, error instanceof Error ? error.stack : undefined);
            throw new HttpException( 'Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR,);
        }

    }

    // udpate user profile (bio, avatar-url)
    async   updateProfile(id:   string, updateUser: UpdateUserDto)
    {
        this.logger.log(`Updating profile for user ${id}`);
        try
        {
            const   updatedUser =  await   this.prisma.user.update(
                {
                    where:
                    {
                        id,
                    },
                    data:
                    {
                        bio:        updateUser.bio,
                        avatarUrl:  updateUser.avatarUrl,
                    },
                    select:
                    {
                        id:         true,
                        email:      true,
                        username:   true,
                        bio:        true,
                        avatarUrl:  true,
                        level:      true,
                        skillLevel: true,
                        xp:         true,
                        updatedAt:  true,
                    },
                }
            );

            this.logger.log(`Profile updated successfully for user ${id}`);
            return updatedUser;
        }
        catch (error)
        {
            if (error instanceof Prisma.PrismaClientKnownRequestError)
            {
                if (error.code === 'P2025')
                    throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
            }
            this.logger.error(`Failed to update profile for user ${id}`, error instanceof Error ? error.stack : undefined);
            throw   new HttpException('Failed to update profile', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // get user info (business-logic fct)
    async   getUserStats(id:    string)
    {
        this.logger.log(`Fetching user stats for user ${id}`);
        try
        {
            const   totalPosition = await this.prisma.position.count(
                {
                    where:
                    {
                        userId: id
                    },
                }
            );

            const   totalTrades = await this.prisma.trade.count(
                {
                    where:
                    {
                        userId: id,
                    },
                }
            );

            const   portfolio = await this.prisma.portfolio.findUnique(
                {
                    where:
                    {
                        userId: id,
                    },
                    select:
                    {
                        totalValue:     true,
                        cashBalance:    true,
                    },
                }
            );

            if (!portfolio)
            {
                this.logger.warn(`User portfolio not found, userId ${id}`);
                throw   new HttpException('User Portfolio not found', HttpStatus.NOT_FOUND);
            }

            return {
                totalPosition,
                totalTrades,
                portfolioValue: portfolio.totalValue,
                cashBalance:    portfolio.cashBalance,
            };
        }
        catch (error)
        {
            if (error instanceof HttpException)
                throw   error;
            this.logger.error(`Failed to fetch user stats for user ${id}`, error instanceof Error ? error.stack : undefined);
            throw   new HttpException('Failed to fetch user stats', HttpStatus.INTERNAL_SERVER_ERROR);
        }        
    }

    //  delete the user
    async   delete(id:  string)
    {
        this.logger.log(`Delete user request for user ${id}`);
        try
        {
            const   deletedUser = await this.prisma.user.delete(
                {
                    where:
                    {
                        id,
                    },
                    select:
                    {
                        id:         true,
                        email:      true,
                        username:   true,
                    }
                }
            );
            this.logger.log(`User deleted successfully, userId ${id}`);
            return{
                message: 'User deleted successfully',
                user: deletedUser,
            };
        }
        catch (error)
        {
            if (error instanceof Prisma.PrismaClientKnownRequestError)
            {
                if (error.code === 'P2025')
                    throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
            }
            this.logger.error(`Failed to delete user ${id}`, error instanceof Error ? error.stack : undefined);
            throw   new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}