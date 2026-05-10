import { Role } from '../../../common/enums/role.enum';

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  password: string; // bcrypt 해시
  role: Role;
  referralCode: string; // 영문 대소문자 6자리 난수
  birthDate?: string;   // YYYY-MM-DD, 선택
  marketingAgreed: boolean;
  createdAt: Date;
}
