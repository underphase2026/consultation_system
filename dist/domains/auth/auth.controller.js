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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const sms_auth_service_1 = require("./sms-auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_owner_dto_1 = require("./dto/register-owner.dto");
const register_staff_dto_1 = require("./dto/register-staff.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const sms_dto_1 = require("./dto/sms.dto");
const jwt_reset_guard_1 = require("../../common/guards/jwt-reset.guard");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const ResetUser = (0, common_1.createParamDecorator)((_, ctx) => ctx.switchToHttp().getRequest().user);
let AuthController = class AuthController {
    authService;
    smsAuthService;
    constructor(authService, smsAuthService) {
        this.authService = authService;
        this.smsAuthService = smsAuthService;
    }
    async login(dto) {
        return this.authService.login(dto);
    }
    async registerOwner(authHeader, dto) {
        const token = this.extractBearerToken(authHeader);
        return this.authService.registerOwner(dto, token);
    }
    async registerStaff(authHeader, dto) {
        const token = this.extractBearerToken(authHeader);
        return this.authService.registerStaff(dto, token);
    }
    extractBearerToken(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.BadRequestException({
                code: 'PHONE_AUTH_REQUIRED',
                message: 'Authorization 헤더에 SMS 인증 토큰이 필요합니다. (Bearer <phoneVerifyToken>)',
            });
        }
        return authHeader.replace('Bearer ', '').trim();
    }
    async sendSmsCode(dto) {
        return this.smsAuthService.sendSmsCode(dto);
    }
    async verifySmsCode(dto) {
        return this.smsAuthService.verifySmsCode(dto);
    }
    issueResetToken(phoneNumber) {
        return this.authService.issueResetToken(phoneNumber);
    }
    forgotPassword(resetUser, dto) {
        return this.authService.forgotPassword(resetUser.phoneNumber, dto);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: '로그인 (휴대폰 번호 + 비밀번호)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'JWT 액세스 토큰 반환', type: auth_response_dto_1.LoginResponseDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('register/owner'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '대표 회원가입 (Authorization: Bearer <phoneVerifyToken> 필요)',
        description: 'SMS 인증 후 발급된 phoneVerifyToken을 Authorization 헤더에 Bearer 토큰으로 담아 호출하세요.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'userId & referralCode 반환', type: auth_response_dto_1.RegisterResponseDto }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, register_owner_dto_1.RegisterOwnerDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerOwner", null);
__decorate([
    (0, common_1.Post)('register/staff'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: '직원 회원가입 (Authorization: Bearer <phoneVerifyToken> 필요)',
        description: 'SMS 인증 후 발급된 phoneVerifyToken을 Authorization 헤더에 Bearer 토큰으로 담아 호출하세요.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'userId 반환', type: auth_response_dto_1.RegisterResponseDto }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, register_staff_dto_1.RegisterStaffDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerStaff", null);
__decorate([
    (0, common_1.Post)('sms/send'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'SMS 인증번호 발송 요청 (분당 3회 제한)',
        description: '입력한 번호로 6자리 인증번호를 발송합니다. 인증번호는 3분간 유효합니다.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '발송 완료', type: auth_response_dto_1.MessageResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 429, description: '너무 많은 요청 (분당 3회 초과)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sms_dto_1.SendSmsDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendSmsCode", null);
__decorate([
    (0, common_1.Post)('sms/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 60000 } }),
    (0, swagger_1.ApiOperation)({
        summary: 'SMS 인증번호 검증 (분당 5회 제한)',
        description: '인증번호 일치 시 5분 유효한 phoneVerifyToken을 반환합니다. 회원가입 시 이 토큰을 사용하세요.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '인증 성공 — phoneVerifyToken 반환',
        schema: {
            example: {
                success: true,
                data: { phoneVerifyToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', expiresIn: 300 },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '인증번호 불일치 또는 만료' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: '너무 많은 요청 (분당 5회 초과)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sms_dto_1.VerifySmsDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifySmsCode", null);
__decorate([
    (0, common_1.Post)('reset-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: '비밀번호 재설정 토큰 발급 (SMS 인증 완료 후 호출)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '10분 유효한 resetToken 반환', type: auth_response_dto_1.ResetTokenResponseDto }),
    __param(0, (0, common_1.Body)('phoneNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "issueResetToken", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.UseGuards)(jwt_reset_guard_1.JwtResetGuard),
    (0, swagger_1.ApiBearerAuth)('reset-token'),
    (0, swagger_1.ApiOperation)({
        summary: '비밀번호 변경 (reset-token 필요)',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '비밀번호 변경 완료' }),
    __param(0, ResetUser()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "forgotPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        sms_auth_service_1.SmsAuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map