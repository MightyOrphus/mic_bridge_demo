import { Test, TestingModule } from '@nestjs/testing';
import { NavHttpClientService } from './nav-http-client.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as ntlm from 'ntlm-client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NavHttpClientService', () => {
  let service: NavHttpClientService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NavHttpClientService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'NAV_BASE_URL') return 'http://mahachak02:7057/MIC_TEST/WS/Mahachak%20Co.,Ltd._New';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<NavHttpClientService>(NavHttpClientService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should include payload and headers in all steps of NTLM handshake', async () => {
    const serviceName = 'Item';
    const soapAction = 'urn:microsoft-dynamics-schemas/page/item:ReadMultiple';
    const xmlPayload = '<soapenv:Envelope>...</soapenv:Envelope>';
    const auth = { user: 'mic2\\mic075', pass: 'user@2023' };

    // Step 1: Initial request -> 401 with Negotiate challenge
    mockedAxios.post.mockResolvedValueOnce({
      status: 401,
      headers: { 'www-authenticate': 'Negotiate' },
    } as any);

    // Step 2: Type 1 Message -> 401 with Type 2 Challenge
    const type2Challenge = 'TlRMTVNTUAACAAAAAAAAACgAAAABggAAASNFZ4mrze8AAAAAAAAAAA==';
    mockedAxios.post.mockResolvedValueOnce({
      status: 401,
      headers: { 'www-authenticate': `Negotiate ${type2Challenge}` },
    } as any);

    // Step 3: Type 3 Message -> 200 OK
    mockedAxios.post.mockResolvedValueOnce({
      status: 200,
      data: '<Soap:Envelope><Soap:Body><ReadMultiple_Result><ReadMultiple_Result>Data</ReadMultiple_Result></ReadMultiple_Result></Soap:Body></Soap:Envelope>',
    } as any);

    const result = await service.post(serviceName, soapAction, xmlPayload, auth);

    expect(mockedAxios.post).toHaveBeenCalledTimes(3);

    // Verify Step 1
    expect(mockedAxios.post).toHaveBeenNthCalledWith(1,
      expect.stringContaining('/Page/Item'),
      xmlPayload,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': soapAction,
        }),
      })
    );

    // Verify Step 2 (The fix!)
    expect(mockedAxios.post).toHaveBeenNthCalledWith(2,
      expect.stringContaining('/Page/Item'),
      xmlPayload, // Should NOT be null
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': soapAction,
          'Authorization': expect.stringMatching(/^NTLM TlRMTVNTUAAB/),
        }),
      })
    );

    // Verify Step 3
    expect(mockedAxios.post).toHaveBeenNthCalledWith(3,
      expect.stringContaining('/Page/Item'),
      xmlPayload,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': soapAction,
          'Authorization': expect.stringMatching(/^NTLM TlRMTVNTUAAD/),
        }),
      })
    );

    expect(result).toBeDefined();
  });
});
