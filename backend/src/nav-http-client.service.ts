import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { NtlmClient } from 'axios-ntlm';
import * as xml2js from 'xml2js';
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';

@Injectable()
export class NavHttpClientService {
  private readonly logger = new Logger(NavHttpClientService.name);

  private readonly httpAgent = new http.Agent({ keepAlive: true, maxSockets: 1 });
  private readonly httpsAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: false, maxSockets: 1 });

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async post(serviceName: string, soapAction: string, xmlPayload: string, customAuth?: { user: string; pass: string }) {
    this.logger.debug(`[RAW AUTH FROM UI] Received User: "${customAuth?.user}" | Pass Length: ${customAuth?.pass?.length || 0}`);

    const baseUrl = this.configService.get<string>('NAV_BASE_URL');
    const url = `${baseUrl}/Page/${serviceName}`;

    if (!customAuth || !customAuth.user || !customAuth.pass) {
      throw new UnauthorizedException('Dynamics NAV credentials are required.');
    }

    const { user: fullUser, pass } = customAuth;
    let domain = '';
    let username = fullUser;

    // Defensively split both single and double backslashes
    const slashRegex = /[\\/]+/;
    if (slashRegex.test(fullUser)) {
      const parts = fullUser.split(slashRegex);
      if (parts.length >= 2) {
        domain = parts[0].trim();
        username = parts[1].trim();
      }
    }

    this.logger.debug(`[NTLM Target] Domain: "${domain}" | Username: "${username}"`);

    const client = NtlmClient({
      username,
      password: pass,
      domain,
      workstation: os.hostname(),
    }, {
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
    });

    try {
      const response = await client.post(url, xmlPayload, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': soapAction,
        },
        validateStatus: () => true,
      });

      if (response.status >= 400) {
        this.logger.error(`NAV Error [${response.status}]: ${JSON.stringify(response.data)}`);
        throw new InternalServerErrorException(`NAV Service Error: ${response.statusText} (${response.status})`);
      }

      const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });
      return this.extractResponseBody(parsed);

    } catch (error: any) {
      if (error instanceof InternalServerErrorException || error instanceof UnauthorizedException) throw error;
      this.logger.error(`NAV SOAP Error: ${error.message}`);
      throw new InternalServerErrorException(`NAV Connection Error: ${error.message}`);
    }
  }

  private extractResponseBody(parsed: any) {
    const envelope = parsed['SOAP-ENV:Envelope'] || parsed['soap:Envelope'] || parsed['Envelope'] || parsed['Soap:Envelope'] || parsed['soap'] || parsed['Soap:Envelope'];
    const body = envelope?.['SOAP-ENV:Body'] || envelope?.['soap:Body'] || envelope?.['Body'] || envelope?.['Soap:Body'];
    return body || parsed;
  }
}
