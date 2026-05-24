import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly enabled: boolean;

  constructor(config: ConfigService, private authService: AuthService) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID') || 'DISABLED';
    super({
      clientID,
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || 'DISABLED',
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost/disabled',
      scope: ['email', 'profile'],
    });
    this.enabled = clientID !== 'DISABLED';
    if (!this.enabled) console.warn('GOOGLE_CLIENT_ID not set — Google OAuth disabled');
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: (err: any, user: any) => void) {
    if (!this.enabled) return done(new Error('Google OAuth not configured'), null);
    const result = await this.authService.handleOAuth({
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
      provider: 'GOOGLE',
      providerId: profile.id,
    });
    done(null, result);
  }
}
