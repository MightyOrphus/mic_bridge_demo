import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { NavHttpClientService } from '../nav-http-client.service';
import { NavSoapService } from '../nav-soap.service';

@Injectable()
export class ItemCategoriesService {
  constructor(
    private readonly navHttpClient: NavHttpClientService,
    private readonly navSoap: NavSoapService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCategories(setSize: number = 100, bookmarkKey: string = '', auth?: { user: string; pass: string }) {
    const cacheKey = `categories_${setSize}_${bookmarkKey || 'start'}`;

    if (!auth) {
      const cached = await this.cacheManager.get(cacheKey);
      if (cached) return cached;
    }

    const xml = this.navSoap.createReadMultipleItemCategoryXml(setSize, bookmarkKey);
    const response = await this.navHttpClient.post('ItemCategory', 'urn:microsoft-dynamics-schemas/page/itemcategory:ReadMultiple', xml, auth);
    const result = response?.ReadMultiple_Result;

    if (result && !auth) {
      await this.cacheManager.set(cacheKey, result, 600000);
    }
    return result;
  }
}
