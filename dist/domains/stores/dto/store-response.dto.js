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
exports.GeocodeResponseDto = exports.JoinStoreResponseDto = exports.CreateStoreResponseDto = exports.StoreItemResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class StoreItemResponseDto {
    storeId;
    storeName;
    address;
    rate;
    ownerName;
    phoneNumber;
}
exports.StoreItemResponseDto = StoreItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-string' }),
    __metadata("design:type", String)
], StoreItemResponseDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '홍길동 강남점' }),
    __metadata("design:type", String)
], StoreItemResponseDto.prototype, "storeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '서울 강남구 테헤란로 123, 2층' }),
    __metadata("design:type", String)
], StoreItemResponseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '프리미엄 요금제', required: false }),
    __metadata("design:type", String)
], StoreItemResponseDto.prototype, "rate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '홍길동' }),
    __metadata("design:type", String)
], StoreItemResponseDto.prototype, "ownerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0212345678' }),
    __metadata("design:type", String)
], StoreItemResponseDto.prototype, "phoneNumber", void 0);
class CreateStoreResponseDto {
    storeId;
    storeName;
    storeCode;
}
exports.CreateStoreResponseDto = CreateStoreResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-string' }),
    __metadata("design:type", String)
], CreateStoreResponseDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '홍길동 강남점' }),
    __metadata("design:type", String)
], CreateStoreResponseDto.prototype, "storeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ABCD1234' }),
    __metadata("design:type", String)
], CreateStoreResponseDto.prototype, "storeCode", void 0);
class JoinStoreResponseDto {
    storeId;
    storeName;
}
exports.JoinStoreResponseDto = JoinStoreResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-string' }),
    __metadata("design:type", String)
], JoinStoreResponseDto.prototype, "storeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '홍길동 강남점' }),
    __metadata("design:type", String)
], JoinStoreResponseDto.prototype, "storeName", void 0);
class GeocodeResponseDto {
    addressName;
    roadAddress;
    jibunAddress;
    lat;
    lng;
}
exports.GeocodeResponseDto = GeocodeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '서울 강남구 테헤란로 123' }),
    __metadata("design:type", String)
], GeocodeResponseDto.prototype, "addressName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '서울 강남구 테헤란로 123', required: false }),
    __metadata("design:type", Object)
], GeocodeResponseDto.prototype, "roadAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '서울 강남구 역삼동 823', required: false }),
    __metadata("design:type", Object)
], GeocodeResponseDto.prototype, "jibunAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 37.5005 }),
    __metadata("design:type", Number)
], GeocodeResponseDto.prototype, "lat", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 127.0364 }),
    __metadata("design:type", Number)
], GeocodeResponseDto.prototype, "lng", void 0);
//# sourceMappingURL=store-response.dto.js.map