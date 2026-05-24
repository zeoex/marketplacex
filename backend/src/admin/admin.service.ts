import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Role, ProductStatus, ReportStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private assertAdmin(role: Role) {
    if (role !== Role.ADMIN && role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
  }

  async getDashboard(role: Role) {
    this.assertAdmin(role);
    const [users, products, orders, reports] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.report.count({ where: { status: ReportStatus.PENDING } }),
    ]);
    return { users, products, orders, pendingReports: reports };
  }

  async getUsers(role: Role, page = 1, limit = 20) {
    this.assertAdmin(role);
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: { id: true, email: true, name: true, username: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, limit };
  }

  async suspendUser(adminRole: Role, userId: string, suspend: boolean) {
    this.assertAdmin(adminRole);
    return this.prisma.user.update({ where: { id: userId }, data: { isActive: !suspend } });
  }

  async getPendingProducts(role: Role, page = 1, limit = 20) {
    this.assertAdmin(role);
    const skip = (page - 1) * limit;
    return this.prisma.product.findMany({
      where: { status: ProductStatus.PENDING },
      include: { seller: { select: { id: true, name: true, email: true } }, images: { take: 1 } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async approveProduct(adminRole: Role, productId: string, approve: boolean) {
    this.assertAdmin(adminRole);
    return this.prisma.product.update({
      where: { id: productId },
      data: { status: approve ? ProductStatus.ACTIVE : ProductStatus.REJECTED },
    });
  }

  async getReports(role: Role, page = 1, limit = 20) {
    this.assertAdmin(role);
    const skip = (page - 1) * limit;
    return this.prisma.report.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportee: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async resolveReport(adminRole: Role, reportId: string, status: ReportStatus) {
    this.assertAdmin(adminRole);
    return this.prisma.report.update({ where: { id: reportId }, data: { status } });
  }
}
