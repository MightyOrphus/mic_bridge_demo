import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NtlmClient } from 'axios-ntlm';
import * as xml2js from 'xml2js';

@Injectable()
export class NavHttpClientService {
  private readonly logger = new Logger(NavHttpClientService.name);

  constructor(
    private readonly configService: ConfigService,
  ) {}

  async post(serviceName: string, soapAction: string, xmlPayload: string, customAuth?: { user: string; pass: string }) {
    const baseUrl = this.configService.get<string>('NAV_BASE_URL');
    // Align with CURL: ensure url handles existing encoding and special chars
    // If the base URL in .env already has %20, we don't want to double encode.
    // However, we must ensure the final URL is valid.
    const url = `${baseUrl}/Page/${serviceName}`;

    if (!baseUrl) {
      this.logger.error('NAV_BASE_URL is not defined in environment variables!');
    }

    if (!customAuth || !customAuth.user || !customAuth.pass) {
      this.logger.warn(`Attempted to call ${serviceName} without credentials.`);
      throw new UnauthorizedException('Dynamics NAV credentials are required.');
    }

    const fullUser = customAuth.user;
    const pass = customAuth.pass;

    this.logger.log(`Requesting ${serviceName} with Action ${soapAction}.`);

    if (this.configService.get<string>('DEBUG') === 'true') {
      this.logger.debug(`Outgoing XML for ${serviceName}:\n${xmlPayload}`);
    }

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
      workstation: '', // Empty workstation is often better for Negotiate
    });

    try {
      const response = await client.post(url, xmlPayload, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          // Aligned with CURL: SOAPAction often requires double quotes around the action string
          'SOAPAction': `"${soapAction}"`,
        },
      });

      const parsed = await xml2js.parseStringPromise(response.data, { explicitArray: false, ignoreAttrs: true });
      return this.extractResponseBody(parsed);
    } catch (error) {
      const errorMsg = error.response?.data || error.message;
      const statusCode = error.response?.status;

      this.logger.error(`NAV SOAP NTLM Error (${serviceName}) [${statusCode}]: ${errorMsg}`);

      if (statusCode === 401 && error.response?.headers?.['www-authenticate']) {
        this.logger.debug(`Auth Challenges: ${error.response.headers['www-authenticate']}`);
      }

      throw new InternalServerErrorException({
        message: `NAV Service Error: ${error.message}`,
        status: statusCode,
        details: error.response?.data ? 'Check server logs for XML response' : undefined,
        navUrl: url
      });
    }
  }

  private extractResponseBody(parsed: any) {
    const envelope = parsed['SOAP-ENV:Envelope'] || parsed['soap:Envelope'] || parsed['Envelope'] || parsed['Soap:Envelope'];
    const body = envelope?.['SOAP-ENV:Body'] || envelope?.['soap:Body'] || envelope?.['Body'] || envelope?.['Soap:Body'];
    return body;
  }
}
