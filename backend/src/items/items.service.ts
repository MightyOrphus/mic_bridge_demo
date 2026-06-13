import { Injectable } from '@nestjs/common';
import { NavHttpClientService } from '../nav-http-client.service';
import { NavSoapService } from '../nav-soap.service';

@Injectable()
export class ItemsService {
  constructor(
    private readonly navHttpClient: NavHttpClientService,
    private readonly navSoap: NavSoapService,
  ) {}

  async getItems(setSize: number = 50, bookmarkKey: string = '', auth?: { user: string; pass: string }) {
    const xml = this.navSoap.createReadMultipleItemXml(setSize, bookmarkKey);
    const response = await this.navHttpClient.post('Item', 'urn:microsoft-dynamics-schemas/page/item:ReadMultiple', xml, auth);
    return response?.ReadMultiple_Result;
  }

  async createItem(itemData: any, auth?: { user: string; pass: string }) {
    const xml = this.navSoap.createItemXml(itemData);
    const response = await this.navHttpClient.post('Item', 'urn:microsoft-dynamics-schemas/page/item:Create', xml, auth);
    return response?.Create_Result;
  }

  async updateItem(itemData: any, auth?: { user: string; pass: string }) {
    const xml = this.navSoap.updateItemXml(itemData);
    const response = await this.navHttpClient.post('Item', 'urn:microsoft-dynamics-schemas/page/item:Update', xml, auth);
    return response?.Update_Result;
  }
}
