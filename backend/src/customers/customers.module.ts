import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { NavHttpClientService } from '../nav-http-client.service';
import { NavSoapService } from '../nav-soap.service';

@Module({
  imports: [HttpModule],
  controllers: [CustomersController],
  providers: [CustomersService, NavHttpClientService, NavSoapService],
})
export class CustomersModule {}
