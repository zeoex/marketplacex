import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(3) username: string;
  @ApiProperty() @IsString() @MinLength(2) name: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
}

export class LoginDto {
  @ApiProperty({ description: 'Email or username' })
  @IsString() emailOrUsername: string;
  @ApiProperty() @IsString() password: string;
}

export class RefreshTokenDto {
  @ApiProperty() @IsString() refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty() @IsEmail() email: string;
}

export class ResetPasswordDto {
  @ApiProperty() @IsString() userId: string;
  @ApiProperty() @IsString() token: string;
  @ApiProperty() @IsString() @MinLength(8) newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty() @IsString() userId: string;
  @ApiProperty() @IsString() code: string;
}

export class VerifyPhoneDto {
  @ApiProperty() @IsString() userId: string;
  @ApiProperty() @IsString() code: string;
}
