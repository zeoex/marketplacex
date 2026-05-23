import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { EmailService } from './services/email.service';
import { SmsService } from './services/sms.service';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  VerifyPhoneDto,
  RefreshTokenDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  // ─── Register ──────────────────────────────────────────────
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (existing) {
      throw new ConflictException(
        existing.email === dto.email ? 'Email already in use' : 'Username already taken',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        name: dto.name,
        password: hashedPassword,
        provider: 'LOCAL',
      },
    });

    // Send verification email
    await this.sendEmailVerification(user.id, user.email!);

    const tokens = await this.generateTokens(user.id, user.email!, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, ...tokens };
  }

  // ─── Login ─────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.emailOrUsername }, { username: dto.emailOrUsername }],
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    if (user.isBanned) throw new UnauthorizedException('Account banned: ' + user.banReason);

    const tokens = await this.generateTokens(user.id, user.email!, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });

    const { password, ...safe } = user;
    return { user: safe, ...tokens };
  }

  // ─── Refresh Tokens ────────────────────────────────────────
  async refreshTokens(dto: RefreshTokenDto) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: dto.refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const tokens = await this.generateTokens(
      session.user.id,
      session.user.email!,
      session.user.role,
    );

    // Rotate refresh token
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return tokens;
  }

  // ─── Logout ────────────────────────────────────────────────
  async logout(refreshToken: string) {
    await this.prisma.session.deleteMany({ where: { refreshToken } });
    return { message: 'Logged out successfully' };
  }

  // ─── OAuth ─────────────────────────────────────────────────
  async handleOAuth(profile: {
    email?: string;
    name: string;
    avatarUrl?: string;
    provider: string;
    providerId: string;
  }) {
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: profile.email },
          { providerId: profile.providerId, provider: profile.provider as any },
        ],
      },
    });

    if (!user) {
      const username = await this.generateUniqueUsername(profile.name);
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          username,
          avatarUrl: profile.avatarUrl,
          provider: profile.provider as any,
          providerId: profile.providerId,
          emailVerified: !!profile.email,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email!, user.role);
    await this.saveRefreshToken(user.id, tokens.refreshToken);
    return { user, ...tokens };
  }

  // ─── Email Verification ────────────────────────────────────
  async sendEmailVerification(userId: string, email: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.prisma.otpCode.create({
      data: {
        userId,
        code: await bcrypt.hash(code, 10),
        type: 'email_verify',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    await this.emailService.sendVerificationEmail(email, code);
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const otps = await this.prisma.otpCode.findMany({
      where: { userId: dto.userId, type: 'email_verify', used: false },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (!otps.length || otps[0].expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired code');
    }

    const valid = await bcrypt.compare(dto.code, otps[0].code);
    if (!valid) throw new BadRequestException('Invalid code');

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: dto.userId }, data: { emailVerified: true } }),
      this.prisma.otpCode.update({ where: { id: otps[0].id }, data: { used: true } }),
    ]);

    return { message: 'Email verified successfully' };
  }

  // ─── Phone OTP ─────────────────────────────────────────────
  async sendPhoneOtp(userId: string, phone: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.prisma.otpCode.create({
      data: {
        userId,
        code: await bcrypt.hash(code, 10),
        type: 'phone_verify',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
      },
    });
    await this.smsService.sendOtp(phone, code);
    return { message: 'OTP sent' };
  }

  async verifyPhone(dto: VerifyPhoneDto) {
    const otps = await this.prisma.otpCode.findMany({
      where: { userId: dto.userId, type: 'phone_verify', used: false },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (!otps.length || otps[0].expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const valid = await bcrypt.compare(dto.code, otps[0].code);
    if (!valid) throw new BadRequestException('Invalid OTP');

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: dto.userId }, data: { phoneVerified: true } }),
      this.prisma.otpCode.update({ where: { id: otps[0].id }, data: { used: true } }),
    ]);

    return { message: 'Phone verified successfully' };
  }

  // ─── Forgot / Reset Password ───────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) return { message: 'If email exists, reset instructions were sent' };

    const token = uuid();
    await this.prisma.otpCode.create({
      data: {
        userId: user.id,
        code: await bcrypt.hash(token, 10),
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await this.emailService.sendPasswordReset(user.email!, token, user.id);
    return { message: 'If email exists, reset instructions were sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const otps = await this.prisma.otpCode.findMany({
      where: { userId: dto.userId, type: 'password_reset', used: false },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (!otps.length || otps[0].expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const valid = await bcrypt.compare(dto.token, otps[0].code);
    if (!valid) throw new BadRequestException('Invalid reset token');

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: dto.userId }, data: { password: hashed } }),
      this.prisma.otpCode.update({ where: { id: otps[0].id }, data: { used: true } }),
      this.prisma.session.deleteMany({ where: { userId: dto.userId } }),
    ]);

    return { message: 'Password reset successfully' };
  }

  // ─── Helpers ───────────────────────────────────────────────
  async generateTokens(userId: string, email: string, role: any) {
    const payload = { sub: userId, email, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);
    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, refreshToken: string, userAgent?: string) {
    await this.prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent,
      },
    });
  }

  private async generateUniqueUsername(name: string): Promise<string> {
    const base = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    let username = base;
    let counter = 0;
    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${base}${++counter}`;
    }
    return username;
  }
}
