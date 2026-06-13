import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { NavHttpClientService } from '../nav-http-client.service';
import { NavSoapService } from '../nav-soap.service';

@Injectable()
export class CustomersService {
  constructor(
    private readonly navHttpClient: NavHttpClientService,
    private readonly navSoap: NavSoapService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCustomers(setSize: number = 50, bookmarkKey: string = '', auth?: { user: string; pass: string }) {
    const cacheKey = `customers_${setSize}_${bookmarkKey || 'start'}`;

    // Only use cache if no custom auth is provided (default backend creds)
    if (!auth) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const xml = this.navSoap.createReadMultipleCustomerXml(setSize, bookmarkKey);
    const response = await this.navHttpClient.post('Customer', 'urn:microsoft-dynamics-schemas/page/customer:ReadMultiple', xml, auth);
    const result = response?.ReadMultiple_Result;

    if (result && !auth) {
      await this.cacheManager.set(cacheKey, result, 600000); // 10 mins
    }
    return result;
  }
}
