import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private client: Twilio | null;

  constructor(private config: ConfigService) {
    const sid = config.get<string>('TWILIO_ACCOUNT_SID');
    const token = config.get<string>('TWILIO_AUTH_TOKEN');
    this.client = sid && token ? new Twilio(sid, token) : null;
    if (!sid || !token) console.warn('Twilio credentials not set — SMS sending disabled');
  }

  async sendOtp(phone: string, code: string) {
    if (!this.client) return;
    await this.client.messages.create({
      body: `Your MarketPlaceX verification code is: ${code}. Valid for 10 minutes.`,
      from: this.config.get<string>('TWILIO_PHONE_NUMBER'),
      to: phone,
    });
  }
}
