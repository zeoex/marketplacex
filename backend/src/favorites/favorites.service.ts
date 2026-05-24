import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, productId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) {
      await this.prisma.favorite.delete({ where: { userId_productId: { userId, productId } } });
      return { favorited: false };
    }
    await this.prisma.favorite.create({ data: { userId, productId } });
    return { favorited: true };
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { product: { include: { images: { take: 1 }, seller: { select: { id: true, name: true, username: true } } } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async isFavorited(userId: string, productId: string) {
    const fav = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return { favorited: !!fav };
  }
}
