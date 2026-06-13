import { Controller, Get, Post, Body, Query, Headers } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly poService: PurchaseOrdersService) {}

  @Get()
  async findAll(
    @Query('setSize') setSize: number,
    @Query('bookmarkKey') bookmarkKey: string,
    @Headers('x-nav-user') user: string,
    @Headers('x-nav-pass') pass: string,
  ) {
    const auth = user && pass ? { user, pass } : undefined;
    return this.poService.findAll(setSize, bookmarkKey, auth);
  }

  @Post()
  async create(
    @Body() poData: any,
    @Headers('x-nav-user') user: string,
    @Headers('x-nav-pass') pass: string,
  ) {
    const auth = user && pass ? { user, pass } : undefined;
    return this.poService.create(poData, auth);
  }
}
