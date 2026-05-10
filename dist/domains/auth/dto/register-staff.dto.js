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
exports.RegisterStaffDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const terms_dto_1 = require("./terms.dto");
class RegisterStaffDto {
    name;
    phoneNumber;
    isPhoneAuth;
    email;
    password;
    terms;
}
exports.RegisterStaffDto = RegisterStaffDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '김직원', description: '이름' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterStaffDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '01098765432', description: '휴대폰 번호' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^01[0-9]{8,9}$/, { message: '올바른 휴대폰 번호 형식이 아닙니다.' }),
    __metadata("design:type", String)
], RegisterStaffDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '휴대폰 인증 완료 여부 (true여야 가입 가능)' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RegisterStaffDto.prototype, "isPhoneAuth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'staff@example.com', description: '이메일 (선택)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: '올바른 이메일 형식이 아닙니다.' }),
    __metadata("design:type", String)
], RegisterStaffDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Password1234!', description: '비밀번호 (최소 8자)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' }),
    __metadata("design:type", String)
], RegisterStaffDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: terms_dto_1.TermsDto, description: '약관 동의' }),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => terms_dto_1.TermsDto),
    __metadata("design:type", terms_dto_1.TermsDto)
], RegisterStaffDto.prototype, "terms", void 0);
//# sourceMappingURL=register-staff.dto.js.map