import { Role } from '../enums/role.enum';
export interface JwtPayload {
    sub: string;
    phoneNumber: string;
    role: Role;
}
export interface ResetJwtPayload {
    sub: string;
    type: 'reset';
}
