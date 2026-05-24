import { Controller, Get, Post, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@Request() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.favoritesService.findByUser(req.user.id, +page, +limit);
  }

  @Post(':productId/toggle')
  toggle(@Param('productId') productId: string, @Request() req: any) {
    return this.favoritesService.toggle(req.user.id, productId);
  }

  @Get(':productId/check')
  check(@Param('productId') productId: string, @Request() req: any) {
    return this.favoritesService.isFavorited(req.user.id, productId);
  }
}
