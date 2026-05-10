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
var PublicDataService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicDataService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PublicDataService = PublicDataService_1 = class PublicDataService {
    configService;
    logger = new common_1.Logger(PublicDataService_1.name);
    apiKey;
    apiUrl = 'https://api.odcloud.kr/api/nts-businessman/v1/status';
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('PUBLIC_DATA_API_KEY', '');
    }
    async verify(request) {
        if (!this.apiKey) {
            this.logger.warn('PUBLIC_DATA_API_KEY가 설정되지 않아 Mock 응답을 반환합니다.');
            return { valid: true, status: '계속사업자 (Mock)' };
        }
        try {
            const res = await fetch(`${this.apiUrl}?serviceKey=${encodeURIComponent(this.apiKey)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businesses: [
                        {
                            b_no: request.businessNumber,
                            p_nm: request.representativeName,
                            start_dt: request.openDate,
                        },
                    ],
                }),
            });
            if (!res.ok) {
                throw new Error(`Public API HTTP Error: ${res.status}`);
            }
            const json = (await res.json());
            const item = json?.data?.[0];
            if (!item)
                return { valid: false, status: '조회 실패' };
            const valid = item.tax_type !== '국세청에 등록되지 않은 사업자입니다.';
            return {
                valid,
                status: item.b_stt ?? item.tax_type ?? '알 수 없음',
            };
        }
        catch (err) {
            this.logger.error('사업자 번호 진위 확인 API 오류', err);
            throw err;
        }
    }
};
exports.PublicDataService = PublicDataService;
exports.PublicDataService = PublicDataService = PublicDataService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PublicDataService);
//# sourceMappingURL=public-data.service.js.map