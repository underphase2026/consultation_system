"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
const role_enum_1 = require("../../common/enums/role.enum");
let AuthService = class AuthService {
    usersService;
    jwtService;
    configService;
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(dto) {
        const user = await this.usersService.findByPhoneNumber(dto.phoneNumber);
        if (!user) {
            throw new common_1.UnauthorizedException({
                code: 'INVALID_CREDENTIALS',
                message: '휴대폰 번호 또는 비밀번호가 올바르지 않습니다.',
            });
        }
        const isMatch = await this.usersService.validatePassword(user, dto.password);
        if (!isMatch) {
            throw new common_1.UnauthorizedException({
                code: 'INVALID_CREDENTIALS',
                message: '휴대폰 번호 또는 비밀번호가 올바르지 않습니다.',
            });
        }
        const payload = {
            sub: user.id,
            phoneNumber: user.phoneNumber,
            role: user.role,
        };
        return {
            accessToken: this.jwtService.sign(payload),
            role: user.role,
            userId: user.id,
        };
    }
    async registerOwner(dto, phoneVerifyToken) {
        this.validateTerms(dto.terms);
        await this.validatePhoneVerifyToken(phoneVerifyToken, dto.phoneNumber);
        const user = await this.usersService.create({
            name: dto.name,
            phoneNumber: dto.phoneNumber,
            email: dto.email,
            password: dto.password,
            role: role_enum_1.Role.OWNER,
            terms: {
                serviceAgreed: dto.terms.serviceAgreed,
                privacyAgreed: dto.terms.privacyAgreed,
                marketingAgreed: dto.terms.marketingAgreed ?? false,
            },
        });
        return {
            userId: user.id,
            referralCode: user.referralCode,
        };
    }
    async registerStaff(dto, phoneVerifyToken) {
        this.validateTerms(dto.terms);
        await this.validatePhoneVerifyToken(phoneVerifyToken, dto.phoneNumber);
        const user = await this.usersService.create({
            name: dto.name,
            phoneNumber: dto.phoneNumber,
            email: dto.email,
            password: dto.password,
            role: role_enum_1.Role.STAFF,
            terms: {
                serviceAgreed: dto.terms.serviceAgreed,
                privacyAgreed: dto.terms.privacyAgreed,
                marketingAgreed: dto.terms.marketingAgreed ?? false,
            },
        });
        return { userId: user.id };
    }
    async issueResetToken(phoneNumber) {
        const user = await this.usersService.findByPhoneNumber(phoneNumber);
        if (!user) {
            throw new common_1.UnauthorizedException({
                code: 'USER_NOT_FOUND',
                message: '가입되지 않은 휴대폰 번호입니다.',
            });
        }
        const payload = { sub: phoneNumber, type: 'reset' };
        const resetToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_RESET_SECRET', 'fallback-reset-secret'),
            expiresIn: this.configService.get('JWT_RESET_EXPIRES_IN', '10m'),
        });
        return { resetToken };
    }
    async forgotPassword(phoneNumber, dto) {
        await this.usersService.updatePasswordByPhone(phoneNumber, dto.newPassword);
        return { message: '비밀번호가 변경되었습니다.' };
    }
    generateSixDigitCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async validatePhoneVerifyToken(token, phoneNumber) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_PHONE_VERIFY_SECRET', 'phone-verify-fallback'),
            });
            if (payload.type !== 'phone-verify' || payload.sub !== phoneNumber) {
                throw new Error('Mismatch');
            }
        }
        catch {
            throw new common_1.BadRequestException({
                code: 'PHONE_AUTH_REQUIRED',
                message: '유효한 휴대폰 인증 토큰이 필요합니다. SMS 인증을 먼저 완료해 주세요.',
            });
        }
    }
    validateTerms(terms) {
        if (!terms.serviceAgreed || !terms.privacyAgreed) {
            throw new common_1.BadRequestException({
                code: 'TERMS_REQUIRED',
                message: '필수 약관에 동의해주세요.',
            });
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map