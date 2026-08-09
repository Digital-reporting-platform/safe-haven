import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UserRole, ServiceProviderType, UserStatus, OTPType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from '../dto/register.dto';
import { CreateUserByAdminDto } from '../dto/create-user-by-admin.dto';
import { UpdateUserByAdminDto } from '../dto/update-user-by-admin.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ActivateAccountDto } from '../dto/activate-account.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { InviteUserDto } from '../dto/invite-user.dto';
import { OTPService } from './otp.service';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Roles that require MFA
  private readonly MFA_ROLES: UserRole[] = [
    UserRole.ADMIN,
    UserRole.COUNSELOR,
    UserRole.MEDICAL_PROFESSIONAL,
    UserRole.LEGAL_ADVISOR,
    UserRole.MODERATOR,
  ];

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OTPService,
    private emailService: EmailService,
  ) {}

  /**
   * Register new SURVIVOR user
   * - Creates unverified user
   * - Sends email verification OTP
   * - Does NOT return JWT (must verify email first)
   */
  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, isEmailVerified: true },
    });

    if (existingUser) {
      if (!existingUser.isEmailVerified) {
        // Re-generate OTP and trigger email in background without blocking response
        const otp = await this.otpService.createOTP(existingUser.id, OTPType.EMAIL_VERIFICATION, 15);
        this.emailService
          .sendOTPEmail(
            dto.email,
            otp.code,
            OTPType.EMAIL_VERIFICATION,
            dto.firstName || undefined,
          )
          .catch((err) => {
            this.logger.error(`Failed to send verification email to ${dto.email}: ${err.message || err}`);
          });

        return {
          user: {
            id: existingUser.id,
            email: dto.email,
            firstName: dto.firstName || null,
            lastName: dto.lastName || null,
            role: UserRole.SURVIVOR,
            isEmailVerified: false,
          },
          message: 'Account already exists but is not verified. A new verification code has been sent to your email.',
        };
      }
      throw new BadRequestException('Email already registered. Please try logging in instead.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user with unverified email
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName || null,
        lastName: dto.lastName || null,
        phone: dto.phone || null,
        role: UserRole.SURVIVOR,
        status: UserStatus.ACTIVE,
        isEmailVerified: false,
        language: dto.language || 'en',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Generate and send email verification OTP asynchronously to prevent API request timeout
    const otp = await this.otpService.createOTP(user.id, OTPType.EMAIL_VERIFICATION, 15);
    this.emailService
      .sendOTPEmail(
        user.email,
        otp.code,
        OTPType.EMAIL_VERIFICATION,
        user.firstName || undefined,
      )
      .catch((err) => {
        this.logger.error(`Failed to send verification email to ${user.email}: ${err.message || err}`);
      });

    this.logger.log(`Survivor registered (unverified): ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      message: 'Registration successful. Please check your email for verification code.',
    };
  }

  /**
   * Verify survivor email with OTP
   */
  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, firstName: true, role: true, isEmailVerified: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Validate OTP
    const isValid = await this.otpService.validateOTP(
      user.id,
      dto.otp,
      OTPType.EMAIL_VERIFICATION,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Mark email as verified
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.firstName || undefined);

    this.logger.log(`Email verified for survivor: ${user.email}`);

    // Generate JWT token for immediate login
    const token = this.generateToken(user);

    return {
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        role: user.role,
        isEmailVerified: true,
      },
    };
  }

  /**
   * Login user
   * - SURVIVOR: Direct JWT after email verification
   * - PROFESSIONAL ROLES: MFA OTP required
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isEmailVerified: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password || '',
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'User account is not active',
      );
    }

    // Check if MFA is required for this role
    const requiresMFA = this.MFA_ROLES.includes(user.role as UserRole);

    if (requiresMFA) {
      // Generate and send MFA OTP (30 min expiry for professional login)
      const otp = await this.otpService.createOTP(user.id, OTPType.LOGIN_OTP, 30);
      
      let devModeCode: string | undefined;
      try {
        await this.emailService.sendOTPEmail(
          user.email,
          otp.code,
          OTPType.LOGIN_OTP,
          user.firstName || undefined,
        );
      } catch (emailError: any) {
        // In dev mode, extract OTP from error message if email fails
        if (emailError?.message?.startsWith('DEV_MODE_OTP:')) {
          devModeCode = emailError.message.replace('DEV_MODE_OTP:', '');
        }
      }

      this.logger.log(`MFA OTP sent for login: ${user.email}`);

      return {
        mfaRequired: true,
        message: 'Please enter the verification code sent to your email',
        devModeCode, // Only present in dev mode when email fails
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    }

    // No MFA required (SURVIVOR) - generate JWT directly
    this.logger.log(`User logged in: ${user.email}`);

    const token = this.generateToken(user);
    const { password: _password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      mfaRequired: false,
    };
  }

  /**
   * Verify MFA OTP for professional login
   */
  async verifyLoginOTP(dto: VerifyOtpDto) {
    this.logger.log(`verifyLoginOTP called with email: "${dto.email}"`);
    
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isEmailVerified: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      this.logger.error(`User not found for email: "${dto.email}"`);
      throw new UnauthorizedException('Invalid credentials');
    }
    
    this.logger.log(`User found: ${user.id}, validating OTP...`)

    // Validate OTP
    const isValid = await this.otpService.validateOTP(
      user.id,
      dto.otp,
      OTPType.LOGIN_OTP,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    this.logger.log(`MFA verified, user logged in: ${user.email}`);

    const token = this.generateToken(user);

    return {
      user,
      token,
      message: 'Login successful',
    };
  }

  /**
   * Verify JWT token and return user
   */
  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          language: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('User not found or inactive');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        language: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  /**
   * Get all users (admin view)
   */
  async getAllUsers() {
    return this.prisma.user.findMany({
      where: {
        deletedAt: null,
        status: { not: UserStatus.DELETED },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        isEmailVerified: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create user by admin (without logging in as that user)
   */
  async createUserByAdmin(dto: CreateUserByAdminDto) {
    this.logger.log(`Admin user creation requested for email: ${dto.email}`);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName || null,
        lastName: dto.lastName || null,
        phone: dto.phone || null,
        role: dto.role,
        language: dto.language || 'en',
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Auto-create ServiceProvider for Medical/Legal professionals
    if (createdUser.role === UserRole.MEDICAL_PROFESSIONAL || createdUser.role === UserRole.LEGAL_ADVISOR) {
      try {
        const providerType = createdUser.role === UserRole.MEDICAL_PROFESSIONAL 
          ? ServiceProviderType.MEDICAL_PROFESSIONAL
          : ServiceProviderType.LEGAL_ADVISOR;
        
        await this.prisma.serviceProvider.create({
          data: {
            name: `${createdUser.firstName || ''} ${createdUser.lastName || ''}`.trim() || createdUser.email,
            email: createdUser.email,
            type: providerType,
            isVerified: true,
            availability: 'available',
            specializations: [createdUser.role === UserRole.MEDICAL_PROFESSIONAL ? 'Medical Support' : 'Legal Assistance'],
            city: 'Addis Ababa',
            rating: 0,
          }
        });
        
        this.logger.log(`Created ServiceProvider for ${createdUser.email} (${providerType})`);
      } catch (error) {
        this.logger.warn(`Failed to create ServiceProvider for ${createdUser.email}: ${(error as Error).message}`);
        // Don't throw - user is already created
      }
    }
    
    this.logger.log(`Admin created user: ${createdUser.email} (${createdUser.id})`);
    return createdUser;
  }

  /**
   * Update user by admin
   */
  async updateUserByAdmin(
    requestingUserId: string,
    userId: string,
    dto: UpdateUserByAdminDto,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!existingUser) {
      throw new BadRequestException('User not found');
    }

    if (
      requestingUserId === userId &&
      dto.role &&
      dto.role !== UserRole.ADMIN
    ) {
      throw new BadRequestException('You cannot remove your own admin role');
    }

    const nextEmail = dto.email?.trim().toLowerCase();
    if (nextEmail && nextEmail !== existingUser.email) {
      const duplicate = await this.prisma.user.findUnique({
        where: { email: nextEmail },
        select: { id: true },
      });

      if (duplicate) {
        throw new BadRequestException('Email already registered');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(nextEmail !== undefined && { email: nextEmail }),
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone || null }),
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.language !== undefined && { language: dto.language }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Soft delete user (admin only)
   */
  async deleteUserById(requestingUserId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (requestingUserId === userId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.DELETED,
        deletedAt: new Date(),
      },
      select: { id: true, email: true },
    });
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    dto: Partial<RegisterDto>,
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
        ...(dto.phone && { phone: dto.phone }),
        ...(dto.language && { language: dto.language }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        language: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Delete own account (soft delete)
   */
  async deleteOwnAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: UserStatus.DELETED,
        deletedAt: new Date(),
      },
    });

    return { message: 'Account deleted successfully' };
  }

     /**
    * Change password
    */
   async changePassword(
     userId: string,
     oldPassword: string,
     newPassword: string,
   ) {
     const user = await this.prisma.user.findUnique({
       where: { id: userId },
       select: { id: true, email: true, password: true },
     });

     if (!user) {
       throw new BadRequestException('User not found');
     }

     // Verify old password
     const isPasswordValid = await bcrypt.compare(
       oldPassword,
       user.password || '',
     );

     if (!isPasswordValid) {
       throw new UnauthorizedException('Current password is incorrect');
     }

     // Hash new password
     const hashedPassword = await bcrypt.hash(newPassword, 10);

     await this.prisma.user.update({
       where: { id: userId },
       data: { password: hashedPassword },
     });

     this.logger.log(`Password changed for user: ${user.email}`);

     return { message: 'Password changed successfully' };
   }

   /**
    * Initiate password reset
    */
   async forgotPassword(dto: ForgotPasswordDto) {
     const user = await this.prisma.user.findUnique({
       where: { email: dto.email },
     });

     // Always return success message to prevent email enumeration
     if (!user) {
       return { message: 'If your email is registered, you will receive a password reset link' };
     }

     // Generate reset token
     const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
     const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

     // Save token to user
     await this.prisma.user.update({
       where: { id: user.id },
       data: {
         resetToken,
         resetTokenExpires,
       },
     });

     // In a real app, you would send an email here
     // For now, we'll just log it
     this.logger.log(`Password reset token for ${user.email}: ${resetToken}`);

     return { message: 'If your email is registered, you will receive a password reset link' };
   }

   /**
    * Reset password with token
    */
   async resetPassword(dto: ResetPasswordDto) {
     const user = await this.prisma.user.findFirst({
       where: {
         resetToken: dto.token,
         resetTokenExpires: {
           gt: new Date(),
         },
       },
     });

     if (!user) {
       throw new BadRequestException('Invalid or expired reset token');
     }

     // Hash new password
     const hashedPassword = await bcrypt.hash(dto.password, 10);

     // Update password and clear reset token
     await this.prisma.user.update({
       where: { id: user.id },
       data: {
         password: hashedPassword,
         resetToken: null,
         resetTokenExpires: null,
       },
     });

     this.logger.log(`Password reset for user: ${user.email}`);

     return { message: 'Password has been reset successfully' };
   }

  /**
   * Invite professional user (Admin only)
   * - Creates user with INVITED status and no password
   * - Sends account activation OTP
   */
  async inviteUser(adminId: string, dto: InviteUserDto) {
    // Validate role is allowed for invitation
    const allowedRoles = new Set<UserRole>([
      UserRole.ADMIN,
      UserRole.COUNSELOR,
      UserRole.MEDICAL_PROFESSIONAL,
      UserRole.LEGAL_ADVISOR,
      UserRole.MODERATOR,
    ]);

    if (!allowedRoles.has(dto.role)) {
      throw new BadRequestException(`Cannot invite users with role: ${dto.role}`);
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Create invited user (no password yet)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: null,
        firstName: dto.firstName || null,
        lastName: dto.lastName || null,
        role: dto.role,
        status: UserStatus.INVITED,
        isEmailVerified: false,
        language: 'en',
      },
    });

    // Generate and send account activation OTP (60 min expiry for account setup)
    const otp = await this.otpService.createOTP(user.id, OTPType.ACCOUNT_ACTIVATION, 60);
    await this.emailService.sendOTPEmail(
      user.email,
      otp.code,
      OTPType.ACCOUNT_ACTIVATION,
      user.firstName || undefined,
    );

    this.logger.log(`User invited by admin ${adminId}: ${user.email} (${user.role})`);

    return {
      message: 'Invitation sent successfully. User will receive activation email.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * Activate professional account
   * - Validates OTP
   * - Sets password
   * - Marks email verified and status ACTIVE
   */
  async activateAccount(dto: ActivateAccountDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found with this email address');
    }

    if (user.status !== UserStatus.INVITED) {
      throw new BadRequestException('Account is not pending activation. It may already be activated.');
    }

    // Check if OTP exists for this user
    const existingOTP = await this.prisma.oTP.findFirst({
      where: {
        userId: user.id,
        type: OTPType.ACCOUNT_ACTIVATION,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!existingOTP) {
      throw new BadRequestException('No activation code found. Please request a new one.');
    }

    // Check if OTP is expired
    if (existingOTP.expiresAt < new Date()) {
      throw new UnauthorizedException('Activation code has expired. Please request a new one.');
    }

    // Check if OTP was already used
    if (existingOTP.usedAt) {
      throw new BadRequestException('This activation code has already been used. Please request a new one.');
    }

    // Check if code matches
    if (existingOTP.code !== dto.otp) {
      throw new UnauthorizedException('Invalid activation code. Please check the code and try again.');
    }

    // Validate OTP (this will mark it as used)
    const isValid = await this.otpService.validateOTP(
      user.id,
      dto.otp,
      OTPType.ACCOUNT_ACTIVATION,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired activation code');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Activate account
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        isEmailVerified: true,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Create ServiceProvider record for Medical/Legal professionals
    if (
      updatedUser.role === UserRole.MEDICAL_PROFESSIONAL ||
      updatedUser.role === UserRole.LEGAL_ADVISOR
    ) {
      try {
        const providerType =
          updatedUser.role === UserRole.MEDICAL_PROFESSIONAL
            ? ServiceProviderType.MEDICAL_PROFESSIONAL
            : ServiceProviderType.LEGAL_ADVISOR;

        await this.prisma.serviceProvider.create({
          data: {
            name:
              `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim() ||
              updatedUser.email,
            email: updatedUser.email,
            type: providerType,
            isVerified: true,
            availability: 'available',
            specializations: [
              updatedUser.role === UserRole.MEDICAL_PROFESSIONAL
                ? 'Medical Support'
                : 'Legal Assistance',
            ],
            city: 'Addis Ababa',
            rating: 0,
          },
        });

        this.logger.log(`Created ServiceProvider for ${updatedUser.email} (${providerType})`);
      } catch (error) {
        this.logger.warn(
          `Failed to create ServiceProvider for ${updatedUser.email}: ${(error as Error).message}`,
        );
      }
    }

    // Send welcome email
    await this.emailService.sendWelcomeEmail(
      updatedUser.email,
      updatedUser.firstName || undefined,
    );

    this.logger.log(`Account activated: ${updatedUser.email}`);

    return {
      message: 'Account activated successfully. You can now log in.',
      user: updatedUser,
    };
  }

  /**
   * Resend OTP code
   */
  async resendOTP(dto: ResendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If your email is registered, you will receive a new code' };
    }

    // Check rate limiting (at least 15 seconds between resends)
    const existingOTP = await this.prisma.oTP.findFirst({
      where: {
        userId: user.id,
        type: dto.type,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingOTP) {
      const secondsSinceLastOTP = (Date.now() - existingOTP.createdAt.getTime()) / 1000;
      if (secondsSinceLastOTP < 15) {
        const waitSeconds = Math.ceil(15 - secondsSinceLastOTP);
        throw new BadRequestException(
          `Please wait ${waitSeconds} seconds before requesting a new code`,
        );
      }
    }

    // Generate new OTP with appropriate expiry time
    const expiryMinutes = dto.type === OTPType.ACCOUNT_ACTIVATION ? 60 : 15;
    const otp = await this.otpService.createOTP(user.id, dto.type, expiryMinutes);

    // Send email asynchronously so API response doesn't hang or fail
    this.emailService
      .sendOTPEmail(
        user.email,
        otp.code,
        dto.type,
        user.firstName || undefined,
      )
      .catch((err) => {
        this.logger.error(`Failed to send OTP email to ${user.email}: ${err.message || err}`);
      });

    this.logger.log(`OTP resent to ${user.email} (${dto.type})`);

    return {
      message: 'If your email is registered, you will receive a new code',
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Get system stats (for admin dashboard)
   */
  async getSystemStats() {
    const [totalUsers, usersByRole, activeUsers, inactiveUsers] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      this.prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      this.prisma.user.count({ where: { status: UserStatus.INACTIVE } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: usersByRole.map(r => ({ role: r.role, count: r._count.role })),
      },
    };
  }

  /**
   * Logout user
   */
  async logout(userId: string) {
    this.logger.log(`User logged out: ${userId}`);
    // Since we're using JWT tokens that are stateless, logout is primarily a client-side operation
    // The token will expire naturally. If needed, we could implement a token blacklist here.
    return { message: 'Logged out successfully' };
  }
}
