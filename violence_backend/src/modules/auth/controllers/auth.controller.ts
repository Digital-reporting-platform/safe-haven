import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  Put,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { CreateUserByAdminDto } from '../dto/create-user-by-admin.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { UpdateUserByAdminDto } from '../dto/update-user-by-admin.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ActivateAccountDto } from '../dto/activate-account.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { ResendOtpDto } from '../dto/resend-otp.dto';
import { InviteUserDto } from '../dto/invite-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
@Throttle({ default: { limit: 3, ttl: 60000 } })
export class AuthController {
  constructor(private authService: AuthService) {}

  private ensurePrivilegedRole(role?: string) {
    if (role !== 'ADMIN' && role !== 'SYSTEM') {
      throw new ForbiddenException('Admin access required');
    }
  }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register new user' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req: any) {
    return this.authService.getUserProfile(req.user.sub);
  }

  @Get('users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  async getUsers(@Request() req: any) {
    this.ensurePrivilegedRole(req.user?.role);
    return this.authService.getAllUsers();
  }

  @Delete('users/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a user (admin only)' })
  async deleteUser(@Request() req: any, @Param('id') id: string) {
    this.ensurePrivilegedRole(req.user?.role);
    return this.authService.deleteUserById(req.user.sub, id);
  }

  @Put('users/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a user (admin only)' })
  async updateUser(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateUserByAdminDto,
  ) {
    this.ensurePrivilegedRole(req.user?.role);
    return this.authService.updateUserByAdmin(req.user.sub, id, dto);
  }

  @Post('users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a user (admin only)' })
  async createUser(@Request() req: any, @Body() dto: CreateUserByAdminDto) {
    this.ensurePrivilegedRole(req.user?.role);
    return this.authService.createUserByAdmin(dto);
  }

  @Put('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @Request() req: any,
    @Body() dto: Partial<RegisterDto>,
  ) {
    return this.authService.updateUserProfile(req.user.sub, dto);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @Request() req: any,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return this.authService.changePassword(
      req.user.sub,
      body.oldPassword,
      body.newPassword,
    );
  }

   @Post('verify-token')
   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @ApiOperation({ summary: 'Verify JWT token' })
   async verifyToken(@Request() req: any) {
     return this.authService.validateToken(
       req.headers.authorization.split(' ')[1],
     );
   }

   @Post('forgot-password')
   @HttpCode(200)
   @ApiOperation({ summary: 'Initiate password reset' })
   async forgotPassword(@Body() dto: ForgotPasswordDto) {
     return this.authService.forgotPassword(dto);
   }

   @Post('reset-password')
   @HttpCode(200)
   @ApiOperation({ summary: 'Reset password with token' })
   async resetPassword(@Body() dto: ResetPasswordDto) {
     return this.authService.resetPassword(dto);
   }

   // ============== OTP & VERIFICATION ENDPOINTS ==============

   @Post('verify-email')
   @HttpCode(200)
   @ApiOperation({ summary: 'Verify survivor email with OTP' })
   async verifyEmail(@Body() dto: VerifyEmailDto) {
     return this.authService.verifyEmail(dto);
   }

   @Post('activate-account')
   @HttpCode(200)
   @ApiOperation({ summary: 'Activate professional account with OTP and set password' })
   async activateAccount(@Body() dto: ActivateAccountDto) {
     return this.authService.activateAccount(dto);
   }

   @Post('verify-otp')
   @HttpCode(200)
   @ApiOperation({ summary: 'Verify MFA OTP for professional login' })
   async verifyOTP(@Body() dto: VerifyOtpDto) {
     return this.authService.verifyLoginOTP(dto);
   }

   @Post('resend-otp')
   @HttpCode(200)
   @ApiOperation({ summary: 'Resend OTP code' })
   async resendOTP(@Body() dto: ResendOtpDto) {
     return this.authService.resendOTP(dto);
   }

   @Post('invite')
   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @HttpCode(201)
   @ApiOperation({ summary: 'Invite professional user (Admin only)' })
   async inviteUser(@Request() req: any, @Body() dto: InviteUserDto) {
     this.ensurePrivilegedRole(req.user?.role);
     return this.authService.inviteUser(req.user.sub, dto);
   }

   @Get('stats')
   @ApiBearerAuth()
   @UseGuards(JwtAuthGuard)
   @ApiOperation({ summary: 'Get system user stats (Admin only)' })
   async getStats(@Request() req: any) {
     this.ensurePrivilegedRole(req.user.role);
     return this.authService.getSystemStats();
   }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.sub);
  }

  @Delete('account')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete own account' })
  async deleteOwnAccount(@Request() req: any) {
    return this.authService.deleteOwnAccount(req.user.sub);
  }
}
