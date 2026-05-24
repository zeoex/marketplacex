import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  private readonly enabled: boolean;

  constructor(config: ConfigService, private authService: AuthService) {
    const clientID = config.get<string>('FACEBOOK_APP_ID') || 'DISABLED';
    super({
      clientID,
      clientSecret: config.get<string>('FACEBOOK_APP_SECRET') || 'DISABLED',
      callbackURL: config.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost/disabled',
      profileFields: ['id', 'displayName', 'emails', 'photos'],
    });
    this.enabled = clientID !== 'DISABLED';
    if (!this.enabled) console.warn('FACEBOOK_APP_ID not set — Facebook OAuth disabled');
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    if (!this.enabled) return done(new Error('Facebook OAuth not configured'), null);
    const result = await this.authService.handleOAuth({
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      avatarUrl: profile.photos?.[0]?.value,
      provider: 'FACEBOOK',
      providerId: profile.id,
    });
    done(null, result);
  }
}
