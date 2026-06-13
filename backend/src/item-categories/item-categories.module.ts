import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ItemCategoriesController } from './item-categories.controller';
import { ItemCategoriesService } from './item-categories.service';
import { NavHttpClientService } from '../nav-http-client.service';
import { NavSoapService } from '../nav-soap.service';

@Module({
  imports: [HttpModule],
  controllers: [ItemCategoriesController],
  providers: [ItemCategoriesService, NavHttpClientService, NavSoapService],
})
export class ItemCategoriesModule {}
