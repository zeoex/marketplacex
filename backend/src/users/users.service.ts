import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        role: true,
        isVerified: true,
        emailVerified: true,
        phoneVerified: true,
        reputationScore: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }

  async update(id: string, data: Partial<{ name: string; bio: string; avatarUrl: string; phone: string }>) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async getPublicProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        reputationScore: true,
        totalSales: true,
        createdAt: true,
        _count: { select: { products: true, followers: true, following: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
