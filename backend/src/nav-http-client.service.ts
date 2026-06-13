import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import * as ntlm from 'ntlm-client';
import * as xml2js from 'xml2js';
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';

@Injectable()
export class NavHttpClientService {
  private readonly logger = new Logger(NavHttpClientService.name);

  // Connection persistence is mandatory for multi-step NTLM/Negotiate authentication
  private readonly httpAgent = new http.Agent({ keepAlive: true });
  private readonly httpsAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async post(serviceName: string, soapAction: string, xmlPayload: string, customAuth?: { user: string; pass: string }) {
    const baseUrl = this.configService.get<string>('NAV_BASE_URL');
    const url = `${baseUrl}/Page/${serviceName}`;

    if (!customAuth || !customAuth.user || !customAuth.pass) {
      throw new UnauthorizedException('Dynamics NAV credentials are required.');
    }

    const { user: fullUser, pass } = customAuth;
    let domain = '';
    let username = fullUser;
    if (fullUser.includes('\\')) {
      [domain, username] = fullUser.split('\\');
    }

    const workstation = os.hostname();
    const axiosConfig = {
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
      validateStatus: () => true, // Manually check status
    };

    const commonHeaders = {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': soapAction,
    };

    try {
      // Step 1: Start with Type 1 Message (Negotiate)
      const type1msg = ntlm.createType1Message(workstation, domain);

      let response = await axios.post(url, xmlPayload, {
        ...axiosConfig,
        headers: {
          ...commonHeaders,
          'Authorization': `Negotiate ${type1msg}`,
        },
      });

      this.logger.debug(`Auth Step 1 - Code: ${response.status}`);

      if (response.status === 401) {
        const type2header = response.headers['www-authenticate'];
        this.logger.debug(`Auth Step 2 Challenge: ${type2header}`);

        if (!type2header) {
          throw new UnauthorizedException('Server did not provide NTLM/Negotiate challenge');
        }

        // Handle both "Negotiate <token>" and "NTLM <token>"
        const base64Challenge = type2header.includes(' ') ? type2header.split(' ')[1] : type2header;
        const authType = type2header.startsWith('NTLM') ? 'NTLM' : 'Negotiate';

        const type2msg = ntlm.decodeType2Message(base64Challenge);
        const type3msg = ntlm.createType3Message(type2msg, username, pass, workstation, domain);

        // Step 2: Final Authenticated Request with Type 3 Message
        response = await axios.post(url, xmlPayload, {
          ...axiosConfig,
          headers: {
            ...commonHeaders,
            'Authorization': `${authType} ${type3msg}`,
          },
        });

        this.logger.debug(`Auth Step 3 - Code: ${response.status}`);
      }

      if (response.status >= 400) {
        this.logger.error(`NAV SOAP Error [${response.status}]: ${JSON.stringify(response.data)}`);
        throw new InternalServerErrorException(`NAV Service Error: ${response.statusText} (${response.status})`);
      }

      const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });
      return this.extractResponseBody(parsed);

    } catch (error: any) {
      if (error instanceof InternalServerErrorException || error instanceof UnauthorizedException) throw error;
      this.logger.error(`NAV Communication Failure: ${error.message}`);
      throw new InternalServerErrorException(`NAV Connection Error: ${error.message}`);
    }
  }

  private extractResponseBody(parsed: any) {
    const envelope = parsed['SOAP-ENV:Envelope'] || parsed['soap:Envelope'] || parsed['Envelope'] || parsed['Soap:Envelope'] || parsed['soap'] || parsed['Soap:Envelope'];
    const body = envelope?.['SOAP-ENV:Body'] || envelope?.['soap:Body'] || envelope?.['Body'] || envelope?.['Soap:Body'];
    return body || parsed;
  }
}
