import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { OTP, OTPType } from '@prisma/client';

@Injectable()
export class OTPService {
  private readonly logger = new Logger(OTPService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate a 6-digit OTP code
   */
  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create and save OTP for a user
   */
  async createOTP(
    userId: string,
    type: OTPType,
    expiresInMinutes: number = 5,
  ): Promise<OTP> {
    // Delete any existing OTPs of the same type for this user
    await this.prisma.oTP.deleteMany({
      where: {
        userId,
        type,
      },
    });

    // Generate new OTP
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    const otp = await this.prisma.oTP.create({
      data: {
        userId,
        code,
        type,
        expiresAt,
      },
    });

    this.logger.log(`OTP created for user ${userId} (${type})`);
    return otp;
  }

  /**
   * Validate OTP code
   */
  async validateOTP(
    userId: string,
    code: string,
    type: OTPType,
  ): Promise<boolean> {
    const otp = await this.prisma.oTP.findFirst({
      where: {
        userId,
        code,
        type,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: null,
      },
    });

    if (!otp) {
      return false;
    }

    // Mark as used
    await this.prisma.oTP.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    this.logger.log(`OTP validated for user ${userId} (${type})`);
    return true;
  }

  /**
   * Validate OTP by email (for flows where userId is not known yet)
   */
  async validateOTPByEmail(
    email: string,
    code: string,
    type: OTPType,
  ): Promise<{ valid: boolean; userId?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return { valid: false };
    }

    const isValid = await this.validateOTP(user.id, code, type);
    return { valid: isValid, userId: isValid ? user.id : undefined };
  }

  /**
   * Delete all OTPs for a user
   */
  async deleteUserOTPs(userId: string, type?: OTPType): Promise<void> {
    await this.prisma.oTP.deleteMany({
      where: {
        userId,
        ...(type && { type }),
      },
    });

    this.logger.log(`OTPs deleted for user ${userId}${type ? ` (${type})` : ''}`);
  }

  /**
   * Clean up expired OTPs (can be run as a cron job)
   */
  async cleanupExpiredOTPs(): Promise<number> {
    const result = await this.prisma.oTP.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usedAt: { not: null } },
        ],
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired/used OTPs`);
    return result.count;
  }

  /**
   * Check if user has a valid OTP
   */
  async hasValidOTP(userId: string, type: OTPType): Promise<boolean> {
    const count = await this.prisma.oTP.count({
      where: {
        userId,
        type,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: null,
      },
    });

    return count > 0;
  }

  /**
   * Get remaining time for OTP in seconds
   */
  async getOTPRemainingTime(userId: string, type: OTPType): Promise<number> {
    const otp = await this.prisma.oTP.findFirst({
      where: {
        userId,
        type,
        expiresAt: {
          gt: new Date(),
        },
        usedAt: null,
      },
      select: { expiresAt: true },
    });

    if (!otp) {
      return 0;
    }

    const remainingMs = otp.expiresAt.getTime() - Date.now();
    return Math.max(0, Math.floor(remainingMs / 1000));
  }
}
