import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend | null;

  constructor(private config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    if (!apiKey) console.warn('RESEND_API_KEY not set — email sending disabled');
  }

  async sendVerificationEmail(to: string, code: string) {
    if (!this.resend) return;
    await this.resend.emails.send({
      from: this.config.get('EMAIL_FROM') || 'MarketPlaceX <noreply@marketplacex.com>',
      to,
      subject: 'Verify your MarketPlaceX email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h1 style="color: #2563eb;">MarketPlaceX</h1>
          <h2>Verify your email address</h2>
          <p>Your verification code is:</p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af;">${code}</span>
          </div>
          <p style="color: #64748b;">This code expires in 24 hours. If you didn't sign up for MarketPlaceX, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendPasswordReset(to: string, token: string, userId: string) {
    if (!this.resend) return;
    const resetUrl = `${this.config.get('APP_URL')}/auth/reset-password?token=${token}&userId=${userId}`;
    await this.resend.emails.send({
      from: this.config.get('EMAIL_FROM') || 'MarketPlaceX <noreply@marketplacex.com>',
      to,
      subject: 'Reset your MarketPlaceX password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h1 style="color: #2563eb;">MarketPlaceX</h1>
          <h2>Reset your password</h2>
          <p>You requested a password reset. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin: 20px 0; font-weight: bold;">
            Reset Password
          </a>
          <p style="color: #64748b;">This link expires in 1 hour. If you didn't request a reset, please ignore this email.</p>
        </div>
      `,
    });
  }

  async sendOrderConfirmation(to: string, orderNumber: string, total: number) {
    if (!this.resend) return;
    await this.resend.emails.send({
      from: this.config.get('EMAIL_FROM') || 'MarketPlaceX <noreply@marketplacex.com>',
      to,
      subject: `Order Confirmed! #${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h1 style="color: #2563eb;">MarketPlaceX</h1>
          <h2>Your order is confirmed! 🎉</h2>
          <p>Order #${orderNumber} has been confirmed.</p>
          <p><strong>Total:</strong> $${total.toFixed(2)}</p>
          <a href="${this.config.get('APP_URL')}/orders" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; margin: 20px 0;">
            View Order
          </a>
        </div>
      `,
    });
  }
}
