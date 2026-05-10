import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ResetJwtPayload } from '../../../common/types/jwt-payload.type';

/**
 * 비밀번호 재설정 전용 단기 JWT 전략
 * payload: { sub: phoneNumber, type: 'reset' }
 */
@Injectable()
export class JwtResetStrategy extends PassportStrategy(Strategy, 'jwt-reset') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_RESET_SECRET',
        'fallback-reset-secret',
      ),
    });
  }

  validate(payload: ResetJwtPayload) {
    if (payload.type !== 'reset') {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: '유효하지 않은 재설정 토큰입니다.',
      });
    }
    // req.user = { phoneNumber: payload.sub }
    return { phoneNumber: payload.sub };
  }
}
