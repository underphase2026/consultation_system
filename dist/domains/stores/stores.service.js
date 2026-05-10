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
exports.StoresService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const users_service_1 = require("../users/users.service");
const role_enum_1 = require("../../common/enums/role.enum");
const business_verify_interface_1 = require("../../infrastructure/public-data/interfaces/business-verify.interface");
let StoresService = class StoresService {
    usersService;
    businessVerifyService;
    store = new Map();
    staffStoreIndex = new Map();
    constructor(usersService, businessVerifyService) {
        this.usersService = usersService;
        this.businessVerifyService = businessVerifyService;
    }
    async getMyStores(userId, role) {
        if (role === role_enum_1.Role.OWNER) {
            const ownerStores = [...this.store.values()].filter((s) => s.ownerId === userId);
            return this.formatStores(ownerStores, userId);
        }
        const storeId = this.staffStoreIndex.get(userId);
        if (!storeId)
            return [];
        const staffStore = this.store.get(storeId);
        if (!staffStore)
            return [];
        return this.formatStores([staffStore], staffStore.ownerId);
    }
    async formatStores(stores, ownerId) {
        const owner = await this.usersService.findById(ownerId);
        return stores.map((s) => ({
            storeId: s.id,
            storeName: s.storeName,
            address: s.detailedAddress,
            rate: s.rate ?? null,
            ownerName: owner?.name ?? '',
            phoneNumber: s.storePhonenumber ?? owner?.phoneNumber ?? '',
        }));
    }
    async createStore(ownerId, dto) {
        for (const s of this.store.values()) {
            if (s.businessRegistrationNumber === dto.businessRegistrationNumber) {
                throw new common_1.ConflictException({
                    code: 'BUSINESS_NUMBER_ALREADY_EXISTS',
                    message: '이미 등록된 사업자 등록번호입니다.',
                });
            }
        }
        const verifyResult = await this.businessVerifyService.verify({
            businessNumber: dto.businessRegistrationNumber,
            representativeName: '',
            openDate: '',
        });
        if (!verifyResult.valid) {
            throw new common_1.BadRequestException({
                code: 'INVALID_BUSINESS_NUMBER',
                message: `사업자 번호 확인 실패: ${verifyResult.status}`,
            });
        }
        const newStore = {
            id: (0, uuid_1.v4)(),
            ownerId,
            storeBusinessName: dto.storeBusinessName,
            storeName: dto.storeName,
            businessRegistrationNumber: dto.businessRegistrationNumber,
            postcode: dto.postcode,
            detailedAddress: dto.detailedAddress,
            storePhonenumber: dto.storePhonenumber,
            storeCode: this.generateStoreCode(),
            staffIds: [],
            createdAt: new Date(),
        };
        this.store.set(newStore.id, newStore);
        return {
            storeId: newStore.id,
            storeName: newStore.storeName,
            storeCode: newStore.storeCode,
        };
    }
    async joinStore(staffId, dto) {
        if (this.staffStoreIndex.has(staffId)) {
            throw new common_1.ConflictException({
                code: 'ALREADY_JOINED',
                message: '이미 매장에 소속되어 있습니다.',
            });
        }
        const target = [...this.store.values()].find((s) => s.storeCode === dto.storeCode);
        if (!target) {
            throw new common_1.NotFoundException({
                code: 'STORE_NOT_FOUND',
                message: '유효하지 않은 매장 코드입니다.',
            });
        }
        target.staffIds.push(staffId);
        this.store.set(target.id, target);
        this.staffStoreIndex.set(staffId, target.id);
        return { storeId: target.id, storeName: target.storeName };
    }
    generateStoreCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code;
        do {
            code = Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        } while ([...this.store.values()].some((s) => s.storeCode === code));
        return code;
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(business_verify_interface_1.BUSINESS_VERIFY_SERVICE)),
    __metadata("design:paramtypes", [users_service_1.UsersService, Object])
], StoresService);
//# sourceMappingURL=stores.service.js.map