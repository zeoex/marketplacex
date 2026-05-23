import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class SmsService {
  private client: Twilio;

  constructor(private config: ConfigService) {
    this.client = new Twilio(
      config.get<string>('TWILIO_ACCOUNT_SID'),
      config.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendOtp(phone: string, code: string) {
    await this.client.messages.create({
      body: `Your MarketPlaceX verification code is: ${code}. Valid for 10 minutes.`,
      from: this.config.get<string>('TWILIO_PHONE_NUMBER'),
      to: phone,
    });
  }
}
