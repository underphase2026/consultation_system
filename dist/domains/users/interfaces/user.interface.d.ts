import { Role } from '../../../common/enums/role.enum';
export interface User {
    id: string;
    name: string;
    phoneNumber: string;
    email?: string;
    password: string;
    role: Role;
    referralCode: string;
    birthDate?: string;
    marketingAgreed: boolean;
    createdAt: Date;
}
