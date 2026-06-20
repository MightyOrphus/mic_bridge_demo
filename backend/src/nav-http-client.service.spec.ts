import { Test, TestingModule } from '@nestjs/testing';
import { NavHttpClientService } from './nav-http-client.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { NtlmClient } from 'axios-ntlm';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('axios-ntlm', () => ({
  NtlmClient: jest.fn(),
}));

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

  it('should call axios-ntlm with correct credentials and agents', async () => {
    const serviceName = 'Item';
    const soapAction = 'urn:microsoft-dynamics-schemas/page/item:ReadMultiple';
    const xmlPayload = '<soapenv:Envelope>...</soapenv:Envelope>';
    const auth = { user: 'mic2\\mic075', pass: 'user@2023' };

    const mockedClient = {
      post: jest.fn().mockResolvedValue({
        status: 200,
        data: '<Soap:Envelope><Soap:Body><ReadMultiple_Result><ReadMultiple_Result>Data</ReadMultiple_Result></ReadMultiple_Result></Soap:Body></Soap:Envelope>',
      }),
    };

    (NtlmClient as jest.Mock).mockReturnValue(mockedClient);

    const result = await service.post(serviceName, soapAction, xmlPayload, auth);

    expect(NtlmClient).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'mic075',
        password: auth.pass,
        domain: 'mic2',
      }),
      expect.objectContaining({
        httpAgent: expect.any(Object),
        httpsAgent: expect.any(Object),
      })
    );

    expect(mockedClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/Page/Item'),
      xmlPayload,
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': soapAction,
        }),
      })
    );

    expect(result).toBeDefined();
  });
});
