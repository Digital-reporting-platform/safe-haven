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
      this.logger.warn('Gmail credentials not configured (GMAIL_USER / GMAIL_APP_PASSWORD missing). Emails will be logged to server console.');
      return;
    }

    // Clean app password (remove spaces if copied as "xxxx xxxx xxxx xxxx")
    const cleanAppPassword = gmailAppPassword.replace(/\s+/g, '');
    const usePort465 = this.configService.get<string>('SMTP_USE_SSL') === 'true';

    const createTransporter = (port: number, secure: boolean) => {
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port,
        secure,
        auth: {
          user: gmailUser,
          pass: cleanAppPassword,
        },
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates in dev/proxy environments
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000,
      });
    };

    // Default to port 587 TLS on cloud hosts like Render unless SMTP_USE_SSL is explicitly set to true
    const primaryPort = usePort465 ? 465 : 587;
    const primarySecure = usePort465;
    this.transporter = createTransporter(primaryPort, primarySecure);

    // Verify connection asynchronously with automatic port fallback
    this.transporter.verify((error) => {
      if (error) {
        this.logger.warn(`Email transporter failed on port ${primaryPort}: ${error.message}`);
        const fallbackPort = primaryPort === 465 ? 587 : 465;
        const fallbackSecure = fallbackPort === 465;
        this.logger.log(`Attempting fallback email transporter on port ${fallbackPort}...`);

        const fallbackTransporter = createTransporter(fallbackPort, fallbackSecure);
        fallbackTransporter.verify((fallbackError) => {
          if (fallbackError) {
            this.logger.error('Email transporter verification failed on all ports:', fallbackError.message);
            this.logger.warn('Check Render environment variables: GMAIL_USER, GMAIL_APP_PASSWORD (16-char App Password), and set SMTP_USE_SSL=false for port 587. Generated OTPs will be logged in server logs.');
          } else {
            this.transporter = fallbackTransporter;
            this.logger.log(`Fallback email transporter ready on port ${fallbackPort}`);
          }
        });
      } else {
        this.logger.log(`Email transporter ready on port ${primaryPort}`);
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

    // If no transporter configured, log OTP to server logs
    if (!this.transporter) {
      this.logger.warn(`[DEV/NO-TRANSPORTER LOG] ${subject} to ${to}: ${code}`);
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
      this.logger.error(`Failed to send email to ${to}: ${errorMessage}`);
      this.logger.warn(`[OTP FALLBACK LOG] Verification OTP for ${to} (${type}): ${code}`);
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
