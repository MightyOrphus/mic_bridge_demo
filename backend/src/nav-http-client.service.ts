import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NtlmClient } from 'axios-ntlm';
import * as xml2js from 'xml2js';

@Injectable()
export class NavHttpClientService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  async post(serviceName: string, soapAction: string, xmlPayload: string, customAuth?: { user: string; pass: string }) {
    const baseUrl = this.configService.get<string>('NAV_BASE_URL');
    const url = `${baseUrl}/Page/${serviceName}`;

    const fullUser = customAuth?.user || this.configService.get<string>('NAV_USER') || '';
    const pass = customAuth?.pass || this.configService.get<string>('NAV_PASS') || '';

    // Split domain\user if present
    let domain = '';
    let username = fullUser;
    if (fullUser.includes('\\')) {
      [domain, username] = fullUser.split('\\');
    }

    const client = NtlmClient({
      username,
      password: pass,
      domain,
      workstation: '',
    });

    try {
      const response = await client.post(url, xmlPayload, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': soapAction,
        },
      });

      const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });
      return this.extractResponseBody(parsed);
    } catch (error) {
      console.error('NAV SOAP NTLM Error:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  private extractResponseBody(parsed: any) {
    const envelope = parsed['SOAP-ENV:Envelope'] || parsed['soap:Envelope'] || parsed['Envelope'];
    const body = envelope?.['SOAP-ENV:Body'] || envelope?.['soap:Body'] || envelope?.['Body'];
    return body;
  }
}
