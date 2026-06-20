import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as ntlm from 'ntlm-client';
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

    const workstation = os.hostname();
    const axiosConfig = {
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
      validateStatus: () => true,
    };

    const commonHeaders = {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': soapAction,
    };

    try {
      // 1. Initial request
      let response = await axios.post(url, xmlPayload, {
        ...axiosConfig,
        headers: { ...commonHeaders },
      });

      if (response.status === 401) {
        const authHeader1 = response.headers['www-authenticate'] || '';
        this.logger.debug(`Step 1 WWW-Authenticate: ${authHeader1}`);

        const authType = 'NTLM';
        const challenges = (Array.isArray(authHeader1) ? authHeader1 : authHeader1.split(',')).map((s: string) => s.trim());
        const negotiate = challenges.find((s: string) => s.toLowerCase().startsWith('negotiate'));
        const ntlmChallenge = challenges.find((s: string) => s.toLowerCase().startsWith('ntlm'));

        if (!negotiate && !ntlmChallenge) {
          throw new UnauthorizedException('Server does not support NTLM or Negotiate');
        }

        const activeChallenge1 = negotiate || ntlmChallenge;
        const challengeParts1 = activeChallenge1!.split(' ');

        let type2msg;
        if (challengeParts1.length > 1) {
          // Server returned Type 2 challenge immediately!
          this.logger.debug('Server returned Type 2 challenge in Step 1. Skipping Type 1 message.');
          type2msg = ntlm.decodeType2Message(challengeParts1[1]);
        } else {
          // Standard flow: Send Type 1 Message
          const type1msg = ntlm.createType1Message(workstation, domain);
          const token1 = type1msg.startsWith('NTLM ') ? type1msg.substring(5) : type1msg;

          response = await axios.post(url, xmlPayload, {
            ...axiosConfig,
            headers: {
              ...commonHeaders,
              'Authorization': `${authType} ${token1}`,
            },
          });

          if (response.status === 401) {
             const type2header = response.headers['www-authenticate'] || '';
             this.logger.debug(`Step 2 WWW-Authenticate: ${type2header}`);

             const challengeParts2 = (Array.isArray(type2header) ? type2header : type2header.split(',')).map((s: string) => s.trim());
             const activeChallenge2 = challengeParts2.find((s: string) => (s.startsWith('NTLM') || s.startsWith('Negotiate')) && s.includes(' '));
             const base64Challenge = activeChallenge2 ? activeChallenge2.split(' ')[1] : '';

             if (base64Challenge) {
               type2msg = ntlm.decodeType2Message(base64Challenge);
             }
          }
        }

        if (type2msg) {
          const type3msg = ntlm.createType3Message(type2msg, username, pass, workstation, domain);
          const token3 = type3msg.startsWith('NTLM ') ? type3msg.substring(5) : type3msg;

          this.logger.debug(`Step 3 Authorization: Sending ${authType} Type 3 token`);

          response = await axios.post(url, xmlPayload, {
            ...axiosConfig,
            headers: {
              ...commonHeaders,
              'Authorization': `${authType} ${token3}`,
            },
          });

          this.logger.debug(`Step 3 Response Status: ${response.status}`);
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
