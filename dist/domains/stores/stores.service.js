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
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const store_entity_1 = require("./entities/store.entity");
const store_staff_entity_1 = require("./entities/store-staff.entity");
const users_service_1 = require("../users/users.service");
const role_enum_1 = require("../../common/enums/role.enum");
const business_verify_interface_1 = require("../../infrastructure/public-data/interfaces/business-verify.interface");
let StoresService = class StoresService {
    storeRepository;
    storeStaffRepository;
    usersService;
    businessVerifyService;
    constructor(storeRepository, storeStaffRepository, usersService, businessVerifyService) {
        this.storeRepository = storeRepository;
        this.storeStaffRepository = storeStaffRepository;
        this.usersService = usersService;
        this.businessVerifyService = businessVerifyService;
    }
    async getMyStores(userId, role) {
        if (role === role_enum_1.Role.OWNER) {
            const stores = await this.storeRepository.find({
                where: { ownerId: userId },
                relations: ['owner'],
            });
            return stores.map((s) => ({
                storeId: s.id,
                storeName: s.storeName,
                address: s.detailedAddress,
                rate: s.rate ?? null,
                ownerName: s.owner?.name ?? '',
                phoneNumber: s.storePhone ?? s.owner?.phoneNumber ?? '',
            }));
        }
        const staffs = await this.storeStaffRepository.find({
            where: { userId },
            relations: ['store', 'store.owner'],
        });
        return staffs.map((st) => {
            const s = st.store;
            return {
                storeId: s.id,
                storeName: s.storeName,
                address: s.detailedAddress,
                rate: s.rate ?? null,
                ownerName: s.owner?.name ?? '',
                phoneNumber: s.storePhone ?? s.owner?.phoneNumber ?? '',
            };
        });
    }
    async createStore(ownerId, dto) {
        const existing = await this.storeRepository.findOne({
            where: { businessRegistrationNumber: dto.businessRegistrationNumber },
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: 'BUSINESS_NUMBER_ALREADY_EXISTS',
                message: '이미 등록된 사업자 등록번호입니다.',
            });
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
        const storeCode = await this.generateStoreCode();
        const newStore = this.storeRepository.create({
            ownerId,
            storeBusinessName: dto.storeBusinessName,
            storeName: dto.storeName,
            businessRegistrationNumber: dto.businessRegistrationNumber,
            postcode: dto.postcode,
            detailedAddress: dto.detailedAddress,
            storePhone: dto.storePhonenumber,
            storeCode,
        });
        await this.storeRepository.save(newStore);
        return {
            storeId: newStore.id,
            storeName: newStore.storeName,
            storeCode: newStore.storeCode,
        };
    }
    async verifyBusinessNumber(businessNumber) {
        const verifyResult = await this.businessVerifyService.verify({
            businessNumber,
            representativeName: '',
            openDate: '',
        });
        if (!verifyResult.valid) {
            throw new common_1.BadRequestException({
                code: 'INVALID_BUSINESS_NUMBER',
                message: `사업자 번호 확인 실패: ${verifyResult.status}`,
            });
        }
        return {
            valid: true,
            status: verifyResult.status,
        };
    }
    async joinStore(staffId, dto) {
        const existing = await this.storeStaffRepository.findOne({
            where: { userId: staffId },
        });
        if (existing) {
            throw new common_1.ConflictException({
                code: 'ALREADY_JOINED',
                message: '이미 매장에 소속되어 있습니다.',
            });
        }
        const target = await this.storeRepository.findOne({
            where: { storeCode: dto.storeCode },
        });
        if (!target) {
            throw new common_1.NotFoundException({
                code: 'STORE_NOT_FOUND',
                message: '유효하지 않은 매장 코드입니다.',
            });
        }
        const storeStaff = this.storeStaffRepository.create({
            userId: staffId,
            storeId: target.id,
        });
        await this.storeStaffRepository.save(storeStaff);
        return { storeId: target.id, storeName: target.storeName };
    }
    async generateStoreCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        let isUsed = true;
        while (isUsed) {
            code = Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
            const count = await this.storeRepository.count({ where: { storeCode: code } });
            isUsed = count > 0;
        }
        return code;
    }
};
exports.StoresService = StoresService;
exports.StoresService = StoresService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(store_entity_1.Store)),
    __param(1, (0, typeorm_1.InjectRepository)(store_staff_entity_1.StoreStaff)),
    __param(3, (0, common_1.Inject)(business_verify_interface_1.BUSINESS_VERIFY_SERVICE)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService, Object])
], StoresService);
//# sourceMappingURL=stores.service.js.map