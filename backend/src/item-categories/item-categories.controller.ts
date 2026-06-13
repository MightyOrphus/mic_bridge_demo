import { Controller, Get, Query, Headers } from '@nestjs/common';
import { ItemCategoriesService } from './item-categories.service';

@Controller('item-categories')
export class ItemCategoriesController {
  constructor(private readonly categoriesService: ItemCategoriesService) {}

  @Get()
  async findAll(
    @Query('setSize') setSize: number,
    @Query('bookmarkKey') bookmarkKey: string,
    @Headers('x-nav-user') user: string,
    @Headers('x-nav-pass') pass: string,
  ) {
    const auth = user && pass ? { user, pass } : undefined;
    return this.categoriesService.getCategories(setSize, bookmarkKey, auth);
  }
}
