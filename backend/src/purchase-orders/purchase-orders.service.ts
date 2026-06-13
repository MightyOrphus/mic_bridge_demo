import { Injectable } from '@nestjs/common';
import { NavHttpClientService } from '../nav-http-client.service';
import { NavSoapService } from '../nav-soap.service';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly navHttpClient: NavHttpClientService,
    private readonly navSoap: NavSoapService,
  ) {}

  async findAll(setSize: number = 50, bookmarkKey: string = '', auth?: { user: string; pass: string }) {
    const xml = this.navSoap.createReadMultiplePOXml(setSize, bookmarkKey);
    const response = await this.navHttpClient.post('PurchaseOrder', 'urn:microsoft-dynamics-schemas/page/purchaseorder:ReadMultiple', xml, auth);
    return response?.ReadMultiple_Result;
  }

  async create(poData: any, auth?: { user: string; pass: string }) {
    const xml = this.navSoap.createPOXml(poData);
    const response = await this.navHttpClient.post('PurchaseOrder', 'urn:microsoft-dynamics-schemas/page/purchaseorder:Create', xml, auth);
    return response?.Create_Result;
  }
}
