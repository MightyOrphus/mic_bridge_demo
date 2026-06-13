import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { PurchaseOrdersService } from './purchase-orders.service';
import { NavHttpClientService } from '../nav-http-client.service';
import { NavSoapService } from '../nav-soap.service';

@Module({
  imports: [HttpModule],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService, NavHttpClientService, NavSoapService],
})
export class PurchaseOrdersModule {}
