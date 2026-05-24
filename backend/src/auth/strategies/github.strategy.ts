import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly enabled: boolean;

  constructor(config: ConfigService, private authService: AuthService) {
    const clientID = config.get<string>('GITHUB_CLIENT_ID') || 'DISABLED';
    super({
      clientID,
      clientSecret: config.get<string>('GITHUB_CLIENT_SECRET') || 'DISABLED',
      callbackURL: config.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost/disabled',
      scope: ['user:email'],
    });
    this.enabled = clientID !== 'DISABLED';
    if (!this.enabled) console.warn('GITHUB_CLIENT_ID not set — GitHub OAuth disabled');
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    if (!this.enabled) return done(new Error('GitHub OAuth not configured'), null);
    const result = await this.authService.handleOAuth({
      email: profile.emails?.[0]?.value,
      name: profile.displayName || profile.username,
      avatarUrl: profile.photos?.[0]?.value,
      provider: 'GITHUB',
      providerId: profile.id,
    });
    done(null, result);
  }
}
