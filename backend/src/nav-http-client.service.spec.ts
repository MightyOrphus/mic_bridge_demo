import { Test, TestingModule } from '@nestjs/testing';
import { NavHttpClientService } from './nav-http-client.service';
import { ConfigService } from '@nestjs/config';
import * as httpntlm from 'httpntlm';

jest.mock('httpntlm', () => ({
  post: jest.fn(),
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

  it('should call httpntlm.post with correct arguments', async () => {
    const serviceName = 'Item';
    const soapAction = 'urn:microsoft-dynamics-schemas/page/item:ReadMultiple';
    const xmlPayload = '<soapenv:Envelope>...</soapenv:Envelope>';
    const auth = { user: 'mic2\\mic075', pass: 'user@2023' };

    (httpntlm.post as jest.Mock).mockImplementation((options, callback) => {
      callback(null, {
        statusCode: 200,
        body: '<Soap:Envelope><Soap:Body><ReadMultiple_Result><ReadMultiple_Result>Data</ReadMultiple_Result></ReadMultiple_Result></Soap:Body></Soap:Envelope>',
      });
    });

    const result = await service.post(serviceName, soapAction, xmlPayload, auth);

    expect(httpntlm.post).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/Page/Item'),
        username: 'mic075',
        password: auth.pass,
        domain: 'mic2',
        body: xmlPayload,
        headers: expect.objectContaining({
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': soapAction,
        }),
      }),
      expect.any(Function)
    );

    expect(result).toBeDefined();
  });
});
