"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    store = new Map();
    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let code;
        do {
            code = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        } while (this.isReferralCodeUsed(code));
        return code;
    }
    isReferralCodeUsed(code) {
        for (const user of this.store.values()) {
            if (user.referralCode === code)
                return true;
        }
        return false;
    }
    async findByPhoneNumber(phoneNumber) {
        for (const user of this.store.values()) {
            if (user.phoneNumber === phoneNumber)
                return user;
        }
        return undefined;
    }
    async findById(id) {
        return this.store.get(id);
    }
    async create(data) {
        const existing = await this.findByPhoneNumber(data.phoneNumber);
        if (existing) {
            throw new common_1.ConflictException({
                code: 'PHONE_ALREADY_EXISTS',
                message: '이미 가입된 휴대폰 번호입니다.',
            });
        }
        const user = {
            id: (0, uuid_1.v4)(),
            name: data.name,
            phoneNumber: data.phoneNumber,
            email: data.email,
            password: await bcrypt.hash(data.password, 10),
            role: data.role,
            referralCode: this.generateReferralCode(),
            marketingAgreed: data.marketingAgreed,
            createdAt: new Date(),
        };
        this.store.set(user.id, user);
        return user;
    }
    async update(id, dto) {
        const user = this.store.get(id);
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'USER_NOT_FOUND',
                message: '사용자를 찾을 수 없습니다.',
            });
        }
        if (dto.phoneNumber && dto.phoneNumber !== user.phoneNumber) {
            const dup = await this.findByPhoneNumber(dto.phoneNumber);
            if (dup) {
                throw new common_1.ConflictException({
                    code: 'PHONE_ALREADY_EXISTS',
                    message: '이미 사용 중인 휴대폰 번호입니다.',
                });
            }
        }
        const updated = {
            ...user,
            name: dto.name ?? user.name,
            phoneNumber: dto.phoneNumber ?? user.phoneNumber,
            password: dto.password
                ? await bcrypt.hash(dto.password, 10)
                : user.password,
            marketingAgreed: dto.marketingAgreed ?? user.marketingAgreed,
        };
        this.store.set(id, updated);
        return updated;
    }
    async updatePasswordByPhone(phoneNumber, newPassword) {
        const user = await this.findByPhoneNumber(phoneNumber);
        if (!user) {
            throw new common_1.NotFoundException({
                code: 'USER_NOT_FOUND',
                message: '사용자를 찾을 수 없습니다.',
            });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        this.store.set(user.id, user);
    }
    async validatePassword(user, plain) {
        return bcrypt.compare(plain, user.password);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
//# sourceMappingURL=users.service.js.map