import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, Request, UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, QueryProductsDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../auth/guards/optional-jwt.guard';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UseGuards(OptionalJwtGuard)
  findAll(@Query() query: QueryProductsDto, @Request() req: any) {
    return this.productsService.findAll(query, req.user?.id);
  }

  @Get('featured')
  getFeatured() {
    return this.productsService.getFeatured();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findMine(@Query() query: QueryProductsDto, @Request() req: any) {
    return this.productsService.findMine(req.user.id, query);
  }

  @Get(':slugOrId')
  findOne(@Param('slugOrId') slugOrId: string) {
    return this.productsService.findOne(slugOrId);
  }

  @Get(':id/related')
  getRelated(@Param('id') id: string) {
    return this.productsService.getRelated(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10, { storage: memoryStorage() }))
  create(
    @Body() dto: CreateProductDto,
    @Request() req: any,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.productsService.create(req.user.id, dto, files);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 10, { storage: memoryStorage() }))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Request() req: any,
    @UploadedFiles() files: Express.Multer.File[] = [],
  ) {
    return this.productsService.update(id, req.user.id, dto, files);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Request() req: any) {
    return this.productsService.remove(id, req.user.id);
  }
}
