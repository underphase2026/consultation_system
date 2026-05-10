import { TermsDto } from './terms.dto';
export declare class RegisterOwnerDto {
    name: string;
    phoneNumber: string;
    isPhoneAuth: boolean;
    email?: string;
    password: string;
    terms: TermsDto;
}
