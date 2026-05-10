export interface BusinessVerifyRequest {
  businessNumber: string;
  representativeName: string;
  openDate: string; // YYYYMMDD
}

export interface BusinessVerifyResult {
  valid: boolean;
  status: string;
}

export const BUSINESS_VERIFY_SERVICE = 'BUSINESS_VERIFY_SERVICE';

export interface IBusinessVerifyService {
  verify(request: BusinessVerifyRequest): Promise<BusinessVerifyResult>;
}
