import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string, filters: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    location?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
  } = {}) {
    const { categoryId, minPrice, maxPrice, condition, location, page = 1, limit = 24, sortBy = 'newest' } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      status: ProductStatus.ACTIVE,
      AND: [],
    };

    if (query) {
      where.AND.push({
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      });
    }
    if (categoryId) where.AND.push({ categoryId });
    if (minPrice !== undefined) where.AND.push({ price: { gte: minPrice } });
    if (maxPrice !== undefined) where.AND.push({ price: { lte: maxPrice } });
    if (condition) where.AND.push({ condition: condition as any });
    if (location) where.AND.push({ location: { contains: location, mode: 'insensitive' } });

    const orderBy: any = {
      newest: { createdAt: 'desc' },
      oldest: { createdAt: 'asc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
      popular: { views: 'desc' },
    }[sortBy] ?? { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: { take: 1 },
          seller: { select: { id: true, name: true, username: true, avatarUrl: true, reputationScore: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getSuggestions(query: string) {
    if (!query || query.length < 2) return [];
    const products = await this.prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        title: { contains: query, mode: 'insensitive' },
      },
      select: { title: true },
      take: 8,
    });
    return [...new Set(products.map((p) => p.title))];
  }
}
