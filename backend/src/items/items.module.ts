import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { NavHttpClientService } from '../nav-http-client.service';
import { NavSoapService } from '../nav-soap.service';

@Module({
  imports: [HttpModule],
  controllers: [ItemsController],
  providers: [ItemsService, NavHttpClientService, NavSoapService],
})
export class ItemsModule {}
