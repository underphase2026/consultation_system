export interface BusinessVerifyRequest {
    businessNumber: string;
    representativeName: string;
    openDate: string;
}
export interface BusinessVerifyResult {
    valid: boolean;
    status: string;
}
export declare const BUSINESS_VERIFY_SERVICE = "BUSINESS_VERIFY_SERVICE";
export interface IBusinessVerifyService {
    verify(request: BusinessVerifyRequest): Promise<BusinessVerifyResult>;
}
