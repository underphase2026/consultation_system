import { ConfigService } from '@nestjs/config';
import { BusinessVerifyRequest, BusinessVerifyResult, IBusinessVerifyService } from './interfaces/business-verify.interface';
export declare class PublicDataService implements IBusinessVerifyService {
    private readonly configService;
    private readonly logger;
    private readonly apiKey;
    private readonly apiUrl;
    constructor(configService: ConfigService);
    verify(request: BusinessVerifyRequest): Promise<BusinessVerifyResult>;
}
