import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { OTPType } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const gmailUser = this.configService.get<string>('GMAIL_USER');
    const gmailAppPassword = this.configService.get<string>('GMAIL_APP_PASSWORD');

    if (!gmailUser || !gmailAppPassword) {
      this.logger.warn('Gmail credentials not configured. Emails will be logged but not sent.');
      return;
    }

    // Try port 465 (SSL) first due to network issues, then fallback to 587 (TLS)
    const usePort465 = this.configService.get<string>('SMTP_USE_SSL') !== 'false';
    
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: usePort465 ? 465 : 587,
      secure: usePort465, // true for 465 (SSL), false for 587 (TLS)
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates in dev
      },
      connectionTimeout: 8000, // 8 seconds timeout
      greetingTimeout: 8000,
      socketTimeout: 8000,
    });

    // Verify connection asynchronously
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Email transporter verification failed:', error.message);
        this.logger.warn('Emails will be logged but may not send. Check your Gmail App Password and network settings.');
      } else {
        this.logger.log(`Email transporter ready (port ${usePort465 ? 465 : 587})`);
      }
    });
  }

  /**
   * Send OTP email based on type
   */
  async sendOTPEmail(
    to: string,
    code: string,
    type: OTPType,
    firstName?: string,
  ): Promise<void> {
    const emailContent = this.getEmailContent(type, code, to, firstName);
    const subject = this.getEmailSubject(type);

    // If no transporter configured (dev mode), just log
    if (!this.transporter) {
      this.logger.log(`[DEV MODE] ${subject} to ${to}: ${code}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"SafeHaven" <${this.configService.get('GMAIL_USER')}>`,
        to,
        subject,
        html: emailContent,
      });

      this.logger.log(`OTP email sent to ${to} (${type})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email to ${to}:`);
      this.logger.error(`Error: ${errorMessage}`);
      
      // Log the OTP in development for testing purposes
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.warn(`[DEV MODE] OTP for ${to}: ${code}`);
        this.logger.warn('Email sending failed but OTP is logged above for testing');
        // Don't throw in dev mode - allow login to continue
        throw new Error(`DEV_MODE_OTP:${code}`);
      }
      
      throw new Error('Failed to send OTP email');
    }
  }

  /**
   * Send welcome email after successful verification
   */
  async sendWelcomeEmail(to: string, firstName?: string): Promise<void> {
    const name = firstName || 'there';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6B705C;">Welcome to SafeHaven, ${name}!</h2>
        <p>Your account has been successfully verified. You can now access all features of the SafeHaven platform.</p>
        <p>We're here to support you on your journey to safety and healing.</p>
        <br>
        <p style="color: #888;">If you have any questions, please don't hesitate to reach out.</p>
        <p><strong>The SafeHaven Team</strong></p>
      </div>
    `;

    if (!this.transporter) {
      this.logger.log(`[DEV MODE] Welcome email to ${to}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"SafeHaven" <${this.configService.get('GMAIL_USER')}>`,
        to,
        subject: 'Welcome to SafeHaven',
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}:`, error);
    }
  }

  /**
   * Get email subject based on OTP type
   */
  private getEmailSubject(type: OTPType): string {
    switch (type) {
      case 'EMAIL_VERIFICATION':
        return 'Verify your SafeHaven email';
      case 'ACCOUNT_ACTIVATION':
        return 'Activate your SafeHaven account';
      case 'LOGIN_OTP':
        return 'Your SafeHaven login code';
      case 'PASSWORD_RESET':
        return 'Reset your SafeHaven password';
      default:
        return 'SafeHaven Verification Code';
    }
  }

  /**
   * Get email HTML content based on OTP type
   */
  private getEmailContent(
    type: OTPType,
    code: string,
    email: string,
    firstName?: string,
  ): string {
    const name = firstName || 'there';

    switch (type) {
      case 'EMAIL_VERIFICATION':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6B705C;">Hello ${name},</h2>
            <p>Thank you for registering with SafeHaven. Please use the verification code below to verify your email address:</p>
            <div style="background: #F5F4F0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #C15B3E;">${code}</span>
            </div>
            <p>This code will expire in <strong>5 minutes</strong>.</p>
            <p style="color: #888; font-size: 12px;">If you didn't create an account with SafeHaven, please ignore this email.</p>
            <br>
            <p><strong>The SafeHaven Team</strong></p>
          </div>
        `;

      case 'ACCOUNT_ACTIVATION': {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
        const activationLink = `${frontendUrl}/auth/activate-account?email=${encodeURIComponent(email || '')}&otp=${code}`;
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6B705C;">Hello ${name},</h2>
            <p>You've been invited to join SafeHaven as a service provider. Please use the activation code below to set up your account:</p>
            <div style="background: #F5F4F0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #C15B3E;">${code}</span>
            </div>
            <p style="text-align: center;">
              <a href="${activationLink}" style="background: #C15B3E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Activate Account</a>
            </p>
            <p style="text-align: center; font-size: 12px; color: #888;">
              Or copy and paste this link:<br>
              <a href="${activationLink}" style="color: #6B705C;">${activationLink}</a>
            </p>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #888; font-size: 12px;">If you didn't request this invitation, please ignore this email.</p>
            <br>
            <p><strong>The SafeHaven Team</strong></p>
          </div>
        `;
      }

      case 'LOGIN_OTP':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6B705C;">Hello ${name},</h2>
            <p>Your SafeHaven login verification code is:</p>
            <div style="background: #F5F4F0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #C15B3E;">${code}</span>
            </div>
            <p>This code will expire in <strong>30 minutes</strong>.</p>
            <p style="color: #888; font-size: 12px;">If you didn't try to log in, please secure your account immediately.</p>
            <br>
            <p><strong>The SafeHaven Team</strong></p>
          </div>
        `;

      case 'PASSWORD_RESET':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6B705C;">Hello ${name},</h2>
            <p>You requested a password reset. Use the code below to reset your password:</p>
            <div style="background: #F5F4F0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #C15B3E;">${code}</span>
            </div>
            <p>This code will expire in <strong>5 minutes</strong>.</p>
            <p style="color: #888; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
            <br>
            <p><strong>The SafeHaven Team</strong></p>
          </div>
        `;

      default:
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6B705C;">Hello ${name},</h2>
            <p>Your verification code is:</p>
            <div style="background: #F5F4F0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #C15B3E;">${code}</span>
            </div>
            <br>
            <p><strong>The SafeHaven Team</strong></p>
          </div>
        `;
    }
  }
}
