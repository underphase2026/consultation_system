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
exports.CreateStoreDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateStoreDto {
    storeBusinessName;
    storeName;
    businessRegistrationNumber;
    postcode;
    roadAddress;
    jibunAddress;
    detailedAddress;
    lat;
    lng;
    storePhonenumber;
}
exports.CreateStoreDto = CreateStoreDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '홍길동통신', description: '사업자등록증 상 상호명' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "storeBusinessName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '홍길동 강남점', description: '매장 표시명' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "storeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1234567890', description: '사업자 등록번호 (10자리, 하이픈 없이)' }),
    (0, class_validator_1.IsNumberString)({}, { message: '사업자 등록번호는 숫자만 입력해주세요.' }),
    (0, class_validator_1.Length)(10, 10, { message: '사업자 등록번호는 10자리여야 합니다.' }),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "businessRegistrationNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '06234', description: '우편번호' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "postcode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '서울 강남구 테헤란로 123', description: '도로명 주소' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "roadAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '서울 강남구 역삼동 123', description: '지번 주소' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "jibunAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2층 201호', description: '상세 주소' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "detailedAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 37.5005, description: '위도 (Latitude)' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStoreDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 127.0364, description: '경도 (Longitude)' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateStoreDto.prototype, "lng", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '0212345678', description: '매장 전화번호 (선택)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^0[0-9]{1,2}[0-9]{3,4}[0-9]{4}$/, {
        message: '올바른 전화번호 형식이 아닙니다.',
    }),
    __metadata("design:type", String)
], CreateStoreDto.prototype, "storePhonenumber", void 0);
//# sourceMappingURL=create-store.dto.js.map