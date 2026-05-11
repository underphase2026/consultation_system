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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let code = '';
        let isUsed = true;
        while (isUsed) {
            code = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
            isUsed = await this.isReferralCodeUsed(code);
        }
        return code;
    }
    async isReferralCodeUsed(code) {
        const count = await this.userRepository.count({ where: { referralCode: code } });
        return count > 0;
    }
    async findByPhoneNumber(phoneNumber) {
        return this.userRepository.findOne({
            where: { phoneNumber },
            relations: ['terms'],
        });
    }
    async findById(id) {
        return this.userRepository.findOne({
            where: { id },
            relations: ['terms'],
        });
    }
    async create(data) {
        const existing = await this.findByPhoneNumber(data.phoneNumber);
        if (existing) {
            throw new common_1.ConflictException({
                code: 'PHONE_ALREADY_EXISTS',
                message: '이미 가입된 휴대폰 번호입니다.',
            });
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const referralCode = await this.generateReferralCode();
        const user = this.userRepository.create({
            name: data.name,
            phoneNumber: data.phoneNumber,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            referralCode,
            terms: {
                serviceAgreed: data.terms.serviceAgreed,
                privacyAgreed: data.terms.privacyAgreed,
                marketingAgreed: data.terms.marketingAgreed,
            },
        });
        return this.userRepository.save(user);
    }
    async update(id, dto) {
        const user = await this.findById(id);
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
            user.phoneNumber = dto.phoneNumber;
        }
        if (dto.name)
            user.name = dto.name;
        if (dto.password) {
            user.password = await bcrypt.hash(dto.password, 10);
        }
        if (dto.marketingAgreed !== undefined && user.terms) {
            user.terms.marketingAgreed = dto.marketingAgreed;
        }
        return this.userRepository.save(user);
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
        await this.userRepository.save(user);
    }
    async validatePassword(user, plain) {
        return bcrypt.compare(plain, user.password);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map