import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomersModule } from './customers/customers.module';
import { ItemCategoriesModule } from './item-categories/item-categories.module';
import { ItemsModule } from './items/items.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { resolve } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(__dirname, '../.env'), // Explicitly look for .env in root
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 600,
    }),
    CustomersModule,
    ItemCategoriesModule,
    ItemsModule,
    PurchaseOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
