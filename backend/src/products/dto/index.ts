import { IsString, IsNumber, IsOptional, IsEnum, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCondition, DeliveryType } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  stock?: number;

  @ApiProperty({ enum: ProductCondition })
  @IsEnum(ProductCondition)
  condition: ProductCondition;

  @ApiPropertyOptional({ enum: DeliveryType })
  @IsOptional()
  @IsEnum(DeliveryType)
  delivery?: DeliveryType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  variants?: Array<{ name: string; value: string; price?: number; stock?: number }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) price?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) stock?: number;
  @ApiPropertyOptional() @IsOptional() @IsEnum(ProductCondition) condition?: ProductCondition;
  @ApiPropertyOptional() @IsOptional() @IsEnum(DeliveryType) delivery?: DeliveryType;
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() tags?: string[];
}

export class QueryProductsDto {
  @IsOptional() @Type(() => Number) page?: number = 1;
  @IsOptional() @Type(() => Number) limit?: number = 20;
  @IsOptional() categoryId?: string;
  @IsOptional() @Type(() => Number) minPrice?: number;
  @IsOptional() @Type(() => Number) maxPrice?: number;
  @IsOptional() condition?: string;
  @IsOptional() delivery?: string;
  @IsOptional() location?: string;
  @IsOptional() sortBy?: string;
  @IsOptional() order?: 'asc' | 'desc';
  @IsOptional() search?: string;
  @IsOptional() sellerId?: string;
}
