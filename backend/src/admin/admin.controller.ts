import { Controller, Get, Patch, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard(@Request() req: any) {
    return this.adminService.getDashboard(req.user.role);
  }

  @Get('users')
  getUsers(@Request() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getUsers(req.user.role, +page, +limit);
  }

  @Patch('users/:id/suspend')
  suspendUser(@Param('id') id: string, @Body('suspend') suspend: boolean, @Request() req: any) {
    return this.adminService.suspendUser(req.user.role, id, suspend);
  }

  @Get('products/pending')
  getPendingProducts(@Request() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getPendingProducts(req.user.role, +page, +limit);
  }

  @Patch('products/:id/approve')
  approveProduct(@Param('id') id: string, @Body('approve') approve: boolean, @Request() req: any) {
    return this.adminService.approveProduct(req.user.role, id, approve);
  }

  @Get('reports')
  getReports(@Request() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getReports(req.user.role, +page, +limit);
  }

  @Patch('reports/:id/resolve')
  resolveReport(@Param('id') id: string, @Body('status') status: any, @Request() req: any) {
    return this.adminService.resolveReport(req.user.role, id, status);
  }
}
