import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, QueryProductsDto } from './dto';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(sellerId: string, dto: CreateProductDto, files: Express.Multer.File[]) {
    const slug = await this.generateSlug(dto.title);

    return this.prisma.product.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        price: dto.price,
        currency: dto.currency || 'USD',
        stock: dto.stock || 1,
        condition: dto.condition,
        delivery: dto.delivery || 'BOTH',
        shippingCost: dto.shippingCost,
        location: dto.location,
        latitude: dto.latitude,
        longitude: dto.longitude,
        status: (dto.status as any) || 'ACTIVE',
        sellerId,
        categoryId: dto.categoryId,
        tags: dto.tags ? { create: dto.tags.map((name) => ({ name })) } : undefined,
        variants: dto.variants ? { create: dto.variants } : undefined,
        images: files.length
          ? {
              create: files.map((f, i) => ({
                url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        tags: true,
        variants: true,
        category: true,
        seller: { select: { id: true, name: true, username: true, avatarUrl: true, reputationScore: true } },
      },
    });
  }

  async findAll(query: QueryProductsDto, userId?: string) {
    const {
      page = 1, limit = 20, categoryId, minPrice, maxPrice,
      condition, delivery, location, sortBy = 'createdAt',
      order = 'desc', search, sellerId,
    } = query;

    const where: any = { status: 'ACTIVE' };
    if (categoryId) where.categoryId = categoryId;
    const minNum = minPrice !== undefined && minPrice !== ('' as any) ? Number(minPrice) : NaN;
    const maxNum = maxPrice !== undefined && maxPrice !== ('' as any) ? Number(maxPrice) : NaN;
    if (!isNaN(minNum) || !isNaN(maxNum)) where.price = {};
    if (!isNaN(minNum)) where.price.gte = minNum;
    if (!isNaN(maxNum)) where.price.lte = maxNum;
    if (condition) where.condition = condition;
    if (delivery) where.delivery = delivery;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (sellerId) where.sellerId = sellerId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { some: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          category: true,
          seller: { select: { id: true, name: true, username: true, avatarUrl: true, reputationScore: true } },
          _count: { select: { favorites: true, reviews: true } },
        },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async findOne(slugOrId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
        status: { not: 'DELETED' },
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        videos: true,
        tags: true,
        variants: true,
        category: true,
        seller: {
          select: {
            id: true, name: true, username: true, avatarUrl: true,
            reputationScore: true, totalSales: true, createdAt: true,
            _count: { select: { products: true } },
          },
        },
        _count: { select: { favorites: true, reviews: true } },
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { reviewer: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    await this.prisma.product.update({
      where: { id: product.id },
      data: { views: { increment: 1 } },
    });

    return product;
  }

  async findMine(userId: string, query: QueryProductsDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = query;
    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { sellerId: userId, status: { not: 'DELETED' } },
        include: {
          images: { take: 1, orderBy: { sortOrder: 'asc' } },
          category: true,
          seller: { select: { id: true, name: true, username: true, avatarUrl: true, reputationScore: true } },
          _count: { select: { favorites: true } },
        },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where: { sellerId: userId, status: { not: 'DELETED' } } }),
    ]);
    return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
  }

  async update(id: string, userId: string, dto: UpdateProductDto, files: Express.Multer.File[] = []) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.sellerId !== userId) throw new ForbiddenException();

    const { tags, keepImageIds, categoryId, ...rest } = dto;

    if (keepImageIds !== undefined) {
      const toDelete = product.images
        .filter((img) => !keepImageIds.includes(img.id))
        .map((img) => img.id);
      if (toDelete.length > 0) {
        await this.prisma.productImage.deleteMany({ where: { id: { in: toDelete } } });
      }
    }

    if (files.length > 0) {
      const currentCount = keepImageIds !== undefined ? keepImageIds.length : product.images.length;
      await this.prisma.productImage.createMany({
        data: files.map((f, i) => ({
          productId: id,
          url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`,
          sortOrder: currentCount + i,
        })),
      });
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        title: rest.title,
        description: rest.description,
        price: rest.price,
        currency: rest.currency,
        stock: rest.stock,
        condition: rest.condition,
        delivery: rest.delivery,
        location: rest.location,
        status: rest.status as any,
        categoryId: categoryId,
        tags: tags ? { deleteMany: {}, create: tags.map((name) => ({ name })) } : undefined,
      },
      include: { images: true, tags: true, variants: true, category: true },
    });
  }

  async remove(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.sellerId !== userId) throw new ForbiddenException();

    await this.prisma.product.update({ where: { id }, data: { status: 'DELETED' } });
    return { message: 'Product deleted' };
  }

  async getFeatured() {
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE', isFeatured: true },
      include: {
        images: { take: 1 },
        seller: { select: { id: true, name: true, username: true, avatarUrl: true } },
        _count: { select: { favorites: true } },
      },
      take: 12,
    });
  }

  async getRelated(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });
    if (!product) return [];

    return this.prisma.product.findMany({
      where: { categoryId: product.categoryId, status: 'ACTIVE', id: { not: productId } },
      include: { images: { take: 1 } },
      take: 8,
    });
  }

  private async generateSlug(title: string): Promise<string> {
    let slug = slugify(title, { lower: true, strict: true });
    const existing = await this.prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;
    return slug;
  }
}
