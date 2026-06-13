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

    // Shared agent for NTLM connection persistence
    const httpAgent = new http.Agent({ keepAlive: true });
    const httpsAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });

    try {
      let response: AxiosResponse | undefined;

      // Step 1: Trigger 401 and find out which auth methods are supported
      try {
        await axios.get(url, { httpAgent, httpsAgent });
      } catch (err: any) {
        if (err.response?.status === 401) {
          const authHeader = err.response.headers['www-authenticate'] || '';
          this.logger.debug(`Initial WWW-Authenticate: ${authHeader}`);

          const challenges = Array.isArray(authHeader) ? authHeader : authHeader.split(',').map((s: string) => s.trim());
          const negotiateChallenge = challenges.find((s: string) => s.toLowerCase().startsWith('negotiate'));
          const ntlmChallenge = challenges.find((s: string) => s.toLowerCase().startsWith('ntlm'));

          if (!negotiateChallenge && !ntlmChallenge) {
             throw new UnauthorizedException(`Server does not support NTLM or Negotiate. Challenge: ${authHeader}`);
          }

          const authType = negotiateChallenge ? 'Negotiate' : 'NTLM';
          const type1msg = ntlm.createType1Message('', domain);

          // Step 2: Send Type 1 Message (GET with Type 1 header, no body/content-type)
          try {
            await axios.get(url, {
              httpAgent,
              httpsAgent,
              headers: {
                'Authorization': `${authType} ${type1msg}`,
              },
            });
          } catch (err2: any) {
            if (err2.response?.status === 401) {
              const type2header = err2.response.headers['www-authenticate'];
              this.logger.debug(`Step 2 Challenge: ${type2header}`);

              // Extract base64 from "Negotiate <base64>" or "NTLM <base64>"
              const base64Challenge = type2header.startsWith(authType) ? type2header.split(' ')[1] : type2header;
              const type2msg = ntlm.decodeType2Message(base64Challenge);
              const type3msg = ntlm.createType3Message(type2msg, username, pass, '', domain);

              // Step 3: Final Authenticated Request (POST with Payload)
              response = await axios.post(url, xmlPayload, {
                httpAgent,
                httpsAgent,
                headers: {
                  'Authorization': `${authType} ${type3msg}`,
                  'Content-Type': 'text/xml; charset=utf-8',
                  'SOAPAction': soapAction, // Using value directly as in proven curl
                },
              });
            } else {
              throw err2;
            }
          }
        } else {
          throw err;
        }
      }

      if (!response) throw new Error('Failed to complete NTLM handshake');

      const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });
      return this.extractResponseBody(parsed);
    } catch (error: any) {
      this.logger.error(`NAV SOAP Error (${serviceName}): ${error.message}`);
      throw new InternalServerErrorException({
        message: `NAV Service Error: ${error.message}`,
        status: error.response?.status,
        navUrl: url
      });
    }
  }

  private extractResponseBody(parsed: any) {
    // Navigate through possible SOAP response structures
    const envelope = parsed['SOAP-ENV:Envelope'] || parsed['soap:Envelope'] || parsed['Envelope'] || parsed['Soap:Envelope'] || parsed['soap'];
    const body = envelope?.['SOAP-ENV:Body'] || envelope?.['soap:Body'] || envelope?.['Body'] || envelope?.['Soap:Body'] || parsed['Soap:Envelope']?.['Soap:Body'];
    return body || parsed;
  }
}
