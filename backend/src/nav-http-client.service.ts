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

    const axiosInstance = axios.create({
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
    });

    try {
      let response: AxiosResponse | undefined;

      // 1. Initial request
      try {
        response = await axiosInstance.post(url, xmlPayload, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': `"${soapAction}"`,
          },
        });
      } catch (err: any) {
        if (err.response?.status === 401) {
          const authHeader = err.response.headers['www-authenticate'] || '';
          const challenges = Array.isArray(authHeader) ? authHeader : authHeader.split(',').map((s: string) => s.trim());

          const negotiate = challenges.find((s: string) => s.toLowerCase().startsWith('negotiate'));
          const ntlmChallenge = challenges.find((s: string) => s.toLowerCase().startsWith('ntlm'));

          if (!negotiate && !ntlmChallenge) {
             throw new UnauthorizedException(`Server does not support NTLM or Negotiate. Challenge: ${authHeader}`);
          }

          const authType = negotiate ? 'Negotiate' : 'NTLM';
          const type1msg = ntlm.createType1Message('', domain);

          try {
            await axiosInstance.post(url, xmlPayload, {
              headers: {
                'Authorization': `${authType} ${type1msg}`,
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': `"${soapAction}"`,
              },
            });
          } catch (err2: any) {
            if (err2.response?.status === 401) {
              const type2header = err2.response.headers['www-authenticate'];
              // Usually returns "NTLM <base64>" or "Negotiate <base64>"
              const base64Challenge = type2header.split(' ')[1];
              const type2msg = ntlm.decodeType2Message(base64Challenge);
              const type3msg = ntlm.createType3Message(type2msg, username, pass, '', domain);

              response = await axiosInstance.post(url, xmlPayload, {
                headers: {
                  'Authorization': `${authType} ${type3msg}`,
                  'Content-Type': 'text/xml; charset=utf-8',
                  'SOAPAction': `"${soapAction}"`,
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

      if (!response) throw new Error('No response from NAV server');

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
    const envelope = parsed['SOAP-ENV:Envelope'] || parsed['soap:Envelope'] || parsed['Envelope'] || parsed['Soap:Envelope'] || parsed['soap'] || parsed['Soap:Envelope'];
    const body = envelope?.['SOAP-ENV:Body'] || envelope?.['soap:Body'] || envelope?.['Body'] || envelope?.['Soap:Body'];
    return body || parsed;
  }
}
