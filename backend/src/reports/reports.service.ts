import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ReportReason } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { reporterId: string; reporteeId?: string; productId?: string; reason: ReportReason; description?: string }) {
    return this.prisma.report.create({ data });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          reportee: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.report.count(),
    ]);
    return { reports, total, page, limit };
  }
}
