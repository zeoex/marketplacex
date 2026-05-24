import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Query('q') q = '',
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('condition') condition?: string,
    @Query('location') location?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 24,
    @Query('sortBy') sortBy = 'newest',
  ) {
    return this.searchService.search(q, {
      categoryId,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
      condition,
      location,
      page: +page,
      limit: +limit,
      sortBy,
    });
  }

  @Get('suggestions')
  suggestions(@Query('q') q = '') {
    return this.searchService.getSuggestions(q);
  }
}
