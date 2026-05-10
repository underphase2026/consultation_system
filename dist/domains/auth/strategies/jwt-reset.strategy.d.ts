import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { ResetJwtPayload } from '../../../common/types/jwt-payload.type';
declare const JwtResetStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtResetStrategy extends JwtResetStrategy_base {
    private readonly configService;
    constructor(configService: ConfigService);
    validate(payload: ResetJwtPayload): {
        phoneNumber: string;
    };
}
export {};
