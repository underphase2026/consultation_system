import { TermsDto } from './terms.dto';
export declare class RegisterStaffDto {
    name: string;
    phoneNumber: string;
    isPhoneAuth: boolean;
    email?: string;
    password: string;
    terms: TermsDto;
}
