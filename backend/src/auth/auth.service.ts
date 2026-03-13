import { Injectable, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt'
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService
{
    private readonly logger = new Logger(AuthService.name);

    constructor
    (
        private prisma:     PrismaService,
        private jwtService: JwtService
    ) {}

    // regiter new user

    async   register(registerDto: RegisterDto)
    {

        try 
        {    
            const   existingUser = await this.prisma.user.findFirst(
                {
                    where:
                    {
                        OR:
                        [
                            {email:    registerDto.email},
                            {username: registerDto.username},
                        ],
                    },
                }
            );
            
            if (existingUser)
            {
                throw new HttpException('Email or username already exist', HttpStatus.BAD_REQUEST,);
            }
            
            const   hashedPassword = await bcrypt.hash(registerDto.password, 10);

            const   user = await this.prisma.user.create(
                {
                    data: 
                    {
                        email:          registerDto.email,
                        username:       registerDto.username,
                        passwordHash:   hashedPassword,
                        totalBalance:   1000000,
                    },
                    select:
                    {
                        id:           true,
                        passwordHash: true,
                        email:        true,
                        skillLevel:   true,
                        username:     true,
                        totalBalance: true,
                        level:        true,
                        xp:           true,
                        createdAt:    true,
                    },
                }
            );

            await   this.prisma.portfolio.create(
                {
                    data:
                    {
                        userId:      user.id,
                        totalValue:  1000000,
                        cashBalance: 1000000,
                    },
                }
            );

            const   token = this.jwtService.sign(
                {
                    sub:      user.id,
                    email:    user.email,
                    username: user.username,
                }
            );
            this.logger.log( { register: 'Successfully'} );
            this.logger.log(`User registered successfully, userId ${user.id}`);
            return {
                message: "User registered successfully",
                user,
                token,
            };
        }
        catch (error)
        {
            this.logger.error('Registration failed', error instanceof Error ? error.stack : undefined);
            if (error instanceof HttpException)
                throw error;
            throw new HttpException( 'Registration failed', HttpStatus.INTERNAL_SERVER_ERROR,);
        
        }
    }

    // login
    async   login(loginDto: LoginDto)
    {
        this.logger.log( { login_attempt: ''} );
        this.logger.log(`Login attempt for email ${loginDto.email}`);
        try
        {
            const   user =  await this.prisma.user.findUnique(
                { where: { email: loginDto.email }, }
            );

            if (!user)
            {
                this.logger.warn('Login failed: user not found for email');
                throw new HttpException(
                    'Invalid credentials',
                    HttpStatus.UNAUTHORIZED,
                );
            }

            const   isPasswordValid = await bcrypt.compare(
                loginDto.password,
                user.passwordHash,
            );

            if (!isPasswordValid)
            {
                this.logger.warn('Login failed: invalid credentials');
                throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
            }

            // update usr status 
            await   this.prisma.user.update(
                {
                    where: { id: user.id },
                    data:
                    {
                        isOnline:   true,
                        lastSeenAt: new Date(),
                    },
                }
            );

            const   token = this.jwtService.sign(
                {
                    sub:      user.id,
                    email:    user.email,
                    username: user.username,   
                }
            );
            this.logger.log( { login_successful: ''} );
            this.logger.log(`Login successful for userId ${user.id}`);
            return {
                message: 'Login successful',
                user :
                {
                    id:             user.id,
                    email:          user.email,
                    username:       user.username,
                    totalBalance:   user.totalBalance,
                    level:          user.level,
                    xp:             user.xp,
                },
                token,
            };

        }
        catch (error)
        {
            this.logger.log( { login_failed: ''} );
            if (error instanceof HttpException)
                  throw error;
            this.logger.error('Login failed', error instanceof Error ? error.stack : undefined);
            throw   new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR,);
        }
    }

    async   validateUser(userId: string)
    {
        const user = await  this.prisma.user.findUnique(
            {
                where: {id: userId},
                select:
                {
                    id:             true,
                    email:          true,
                    username:       true,
                    totalBalance:   true,
                    level:          true,
                    xp:             true,
                },
            }
        );

        if (!user)
        {
            this.logger.warn(`Validate user failed: user not found, userId ${userId}`);
            throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
        }
    
        return user;
    }
}