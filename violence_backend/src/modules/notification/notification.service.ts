import { Injectable, Logger } from '@nestjs/common';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async sendReportStatusUpdate(
    contactEmail: string,
    reportId: string,
    status: string,
    category: string
  ): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      PENDING_REVIEW: 'Your report is under review by our team.',
      INVESTIGATING: 'Your report is now being investigated.',
      IN_PROGRESS: 'Your case is in progress.',
      RESOLVED: 'Your case has been resolved. Thank you for your courage.',
    };

    const statusMessage = statusMessages[status] || 'There is an update on your report.';

    const emailContent = {
      to: contactEmail,
      subject: `SafeHaven Report Update - ${reportId.substring(0, 8)}`,
      body: `
Dear Survivor,

${statusMessage}

Report ID: ${reportId}
Category: ${category}
Status: ${status.replace('_', ' ')}

If you need further assistance, please contact our support team.

Stay safe,
SafeHaven Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #C15B3E; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SafeHaven Report Update</h1>
    </div>
    <div class="content">
      <p>Dear Survivor,</p>
      <p><strong>${statusMessage}</strong></p>
      <hr>
      <p><strong>Report ID:</strong> ${reportId.substring(0, 8)}...</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Status:</strong> ${status.replace('_', ' ')}</p>
      <hr>
      <p>If you need further assistance, please contact our support team.</p>
      <p>Stay safe,<br>SafeHaven Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message from SafeHaven. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };

    return this.sendEmail(emailContent);
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      this.logger.log(`Sending email to ${options.to}: ${options.subject}`);

      console.log('=== EMAIL NOTIFICATION ===');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body: ${options.body}`);
      console.log('=========================');

      this.logger.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Send notification when a professional sends a new message to a survivor
   */
  async sendNewMessageNotification(
    contactEmail: string,
    reportId: string,
    senderName: string,
    senderRole: string,
    messagePreview: string,
  ): Promise<boolean> {
    const truncatedMessage = messagePreview.length > 100
      ? messagePreview.substring(0, 100) + '...'
      : messagePreview;

    const emailContent = {
      to: contactEmail,
      subject: `New Message from ${senderName} - Case ${reportId.substring(0, 8)}`,
      body: `
Dear Survivor,

You have received a new message from ${senderName} (${senderRole.replace(/_/g, ' ').toLowerCase()}).

Message:
"${truncatedMessage}"

Please log in to your SafeHaven account to view the full message and respond.

Report ID: ${reportId}

Stay safe,
SafeHaven Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #C15B3E; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .message-box { background: white; padding: 15px; border-left: 4px solid #C15B3E; margin: 15px 0; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .btn { display: inline-block; background: #C15B3E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>New Message Received</h1>
    </div>
    <div class="content">
      <p>Dear Survivor,</p>
      <p>You have received a new message from <strong>${senderName}</strong> (${senderRole.replace(/_/g, ' ').toLowerCase()}).</p>
      <div class="message-box">
        <p><em>"${truncatedMessage}"</em></p>
      </div>
      <p>Please log in to your SafeHaven account to view the full message and respond.</p>
      <p><strong>Report ID:</strong> ${reportId.substring(0, 8)}...</p>
      <p>Stay safe,<br>SafeHaven Team</p>
    </div>
    <div class="footer">
      <p>This is an automated message from SafeHaven. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    };

    return this.sendEmail(emailContent);
  }
}