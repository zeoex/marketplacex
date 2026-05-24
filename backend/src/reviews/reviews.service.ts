import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { reviewerId: string; revieweeId: string; orderId?: string; productId?: string; rating: number; comment?: string }) {
    const existing = await this.prisma.review.findFirst({
      where: { reviewerId: data.reviewerId, revieweeId: data.revieweeId, orderId: data.orderId ?? null },
    });
    if (existing) throw new ConflictException('Review already exists');

    const review = await this.prisma.review.create({ data });

    // Update user reputation score
    const stats = await this.prisma.review.aggregate({
      where: { revieweeId: data.revieweeId },
      _avg: { rating: true },
    });
    await this.prisma.user.update({
      where: { id: data.revieweeId },
      data: { reputationScore: stats._avg.rating ?? 0 },
    });

    return review;
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.review.findMany({
      where: { revieweeId: userId },
      include: { reviewer: { select: { id: true, name: true, avatarUrl: true, username: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }
}
