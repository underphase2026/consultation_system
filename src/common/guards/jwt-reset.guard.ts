import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** 비밀번호 재설정 전용 단기 토큰 가드 (strategy: jwt-reset) */
@Injectable()
export class JwtResetGuard extends AuthGuard('jwt-reset') {}
