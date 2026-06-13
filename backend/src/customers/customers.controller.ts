import { Controller, Get, Query, Headers } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll(
    @Query('setSize') setSize: number,
    @Query('bookmarkKey') bookmarkKey: string,
    @Headers('x-nav-user') user: string,
    @Headers('x-nav-pass') pass: string,
  ) {
    const auth = user && pass ? { user, pass } : undefined;
    return this.customersService.getCustomers(setSize, bookmarkKey, auth);
  }
}
