import { Controller, Get, Post, Patch, Body, Query, Headers } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  async findAll(
    @Query('setSize') setSize: number,
    @Query('bookmarkKey') bookmarkKey: string,
    @Headers('x-nav-user') user: string,
    @Headers('x-nav-pass') pass: string,
  ) {
    const auth = user && pass ? { user, pass } : undefined;
    return this.itemsService.getItems(setSize, bookmarkKey, auth);
  }

  @Post()
  async create(
    @Body() itemData: any,
    @Headers('x-nav-user') user: string,
    @Headers('x-nav-pass') pass: string,
  ) {
    const auth = user && pass ? { user, pass } : undefined;
    return this.itemsService.createItem(itemData, auth);
  }

  @Patch()
  async update(
    @Body() itemData: any,
    @Headers('x-nav-user') user: string,
    @Headers('x-nav-pass') pass: string,
  ) {
    const auth = user && pass ? { user, pass } : undefined;
    return this.itemsService.updateItem(itemData, auth);
  }
}
