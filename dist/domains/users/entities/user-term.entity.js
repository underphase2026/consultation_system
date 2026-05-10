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
exports.UserTerm = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let UserTerm = class UserTerm {
    userId;
    serviceAgreed;
    privacyAgreed;
    marketingAgreed;
    createdAt;
    updatedAt;
    user;
};
exports.UserTerm = UserTerm;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid', name: 'user_id' }),
    __metadata("design:type", String)
], UserTerm.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'service_agreed' }),
    __metadata("design:type", Boolean)
], UserTerm.prototype, "serviceAgreed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'privacy_agreed' }),
    __metadata("design:type", Boolean)
], UserTerm.prototype, "privacyAgreed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'marketing_agreed' }),
    __metadata("design:type", Boolean)
], UserTerm.prototype, "marketingAgreed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserTerm.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], UserTerm.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.terms, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], UserTerm.prototype, "user", void 0);
exports.UserTerm = UserTerm = __decorate([
    (0, typeorm_1.Entity)('user_terms')
], UserTerm);
//# sourceMappingURL=user-term.entity.js.map