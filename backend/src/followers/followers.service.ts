import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class FollowersService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(followerId: string, followingId: string) {
    if (followerId === followingId) return { following: false };
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) {
      await this.prisma.follow.delete({ where: { followerId_followingId: { followerId, followingId } } });
      return { following: false };
    }
    await this.prisma.follow.create({ data: { followerId, followingId } });
    return { following: true };
  }

  async getFollowers(userId: string) {
    return this.prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, name: true, username: true, avatar: true } } },
    });
  }

  async getFollowing(userId: string) {
    return this.prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, name: true, username: true, avatar: true } } },
    });
  }
}
