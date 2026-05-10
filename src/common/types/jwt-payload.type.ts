import { Role } from '../enums/role.enum';

export interface JwtPayload {
  sub: string;       // userId
  phoneNumber: string;
  role: Role;
}

/** 비밀번호 재설정용 단기 토큰 payload */
export interface ResetJwtPayload {
  sub: string;       // phoneNumber
  type: 'reset';
}
