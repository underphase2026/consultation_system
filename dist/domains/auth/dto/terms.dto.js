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
exports.TermsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class TermsDto {
    serviceAgreed;
    privacyAgreed;
    marketingAgreed;
}
exports.TermsDto = TermsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: '이용 약관 동의 (필수, true여야 함)' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TermsDto.prototype, "serviceAgreed", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '개인정보 수집 동의 (필수, true여야 함)' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TermsDto.prototype, "privacyAgreed", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '마케팅 수신 동의 (선택)', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TermsDto.prototype, "marketingAgreed", void 0);
//# sourceMappingURL=terms.dto.js.map