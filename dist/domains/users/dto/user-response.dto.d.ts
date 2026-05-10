import { Role } from '../../../common/enums/role.enum';
export declare class UserProfileResponseDto {
    id: string;
    phoneNumber: string;
    name: string;
    email?: string;
    role: Role;
    referralCode: string;
}
