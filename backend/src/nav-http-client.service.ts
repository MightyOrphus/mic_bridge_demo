import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import * as ntlm from 'ntlm-client';
import * as xml2js from 'xml2js';
import * as http from 'http';
import * as https from 'https';

@Injectable()
export class NavHttpClientService {
  private readonly logger = new Logger(NavHttpClientService.name);

  // Persistent agents to maintain authenticated connections
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

    const axiosConfig = {
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
      validateStatus: () => true, // Don't throw on 401
    };

    try {
      // Step 1: Initial Request to get Challenge
      let response = await axios.post(url, null, {
        ...axiosConfig,
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': soapAction,
        },
      });

      if (response.status === 401) {
        const authHeader = response.headers['www-authenticate'] || '';
        this.logger.debug(`Handshake Step 1 - Challenge: ${authHeader}`);

        const challenges = Array.isArray(authHeader) ? authHeader : authHeader.split(',').map((s: string) => s.trim());
        const negotiate = challenges.find((s: string) => s.toLowerCase().startsWith('negotiate'));
        const ntlmChallenge = challenges.find((s: string) => s.toLowerCase().startsWith('ntlm'));

        if (!negotiate && !ntlmChallenge) {
          throw new UnauthorizedException(`Server rejected credentials and does not support NTLM/Negotiate: ${authHeader}`);
        }

        const authType = negotiate ? 'Negotiate' : 'NTLM';
        const type1msg = ntlm.createType1Message('', domain);

        // Step 2: Send Type 1 Message
        response = await axios.post(url, null, {
          ...axiosConfig,
          headers: {
            'Authorization': `${authType} ${type1msg}`,
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': soapAction,
          },
        });

        if (response.status === 401) {
          const type2header = response.headers['www-authenticate'];
          this.logger.debug(`Handshake Step 2 - Challenge: ${type2header}`);

          // Extract the token from "Negotiate <token>" or just "<token>"
          const base64Challenge = type2header.includes(' ') ? type2header.split(' ')[1] : type2header;
          const type2msg = ntlm.decodeType2Message(base64Challenge);
          const type3msg = ntlm.createType3Message(type2msg, username, pass, '', domain);

          // Step 3: Send Type 3 Message with Real Payload
          response = await axios.post(url, xmlPayload, {
            ...axiosConfig,
            headers: {
              'Authorization': `${authType} ${type3msg}`,
              'Content-Type': 'text/xml; charset=utf-8',
              'SOAPAction': soapAction,
            },
          });
        }
      }

      if (response.status >= 400) {
        this.logger.error(`NAV Error [${response.status}]: ${JSON.stringify(response.data)}`);
        throw new InternalServerErrorException(`NAV Service Error: ${response.statusText} (${response.status})`);
      }

      const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });
      return this.extractResponseBody(parsed);
    } catch (error: any) {
      if (error instanceof InternalServerErrorException || error instanceof UnauthorizedException) throw error;
      this.logger.error(`NAV Communication Error: ${error.message}`);
      throw new InternalServerErrorException(`NAV Connection Error: ${error.message}`);
    }
  }

  private extractResponseBody(parsed: any) {
    const envelope = parsed['SOAP-ENV:Envelope'] || parsed['soap:Envelope'] || parsed['Envelope'] || parsed['Soap:Envelope'] || parsed['soap'];
    const body = envelope?.['SOAP-ENV:Body'] || envelope?.['soap:Body'] || envelope?.['Body'] || envelope?.['Soap:Body'];
    return body || parsed;
  }
}
