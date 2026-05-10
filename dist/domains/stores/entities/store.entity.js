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
exports.Store = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const store_staff_entity_1 = require("./store-staff.entity");
let Store = class Store {
    id;
    ownerId;
    storeBusinessName;
    storeName;
    businessRegistrationNumber;
    postcode;
    detailedAddress;
    storePhone;
    storeCode;
    rate;
    createdAt;
    updatedAt;
    deletedAt;
    owner;
    staffs;
};
exports.Store = Store;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Store.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'owner_id' }),
    __metadata("design:type", String)
], Store.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'store_business_name' }),
    __metadata("design:type", String)
], Store.prototype, "storeBusinessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'store_name' }),
    __metadata("design:type", String)
], Store.prototype, "storeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'business_registration_number', unique: true }),
    __metadata("design:type", String)
], Store.prototype, "businessRegistrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Store.prototype, "postcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'detailed_address' }),
    __metadata("design:type", String)
], Store.prototype, "detailedAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'store_phone', nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "storePhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'store_code', unique: true }),
    __metadata("design:type", String)
], Store.prototype, "storeCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Store.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Store.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Store.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Date)
], Store.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.ownedStores, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'owner_id' }),
    __metadata("design:type", user_entity_1.User)
], Store.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => store_staff_entity_1.StoreStaff, (storeStaff) => storeStaff.store),
    __metadata("design:type", Array)
], Store.prototype, "staffs", void 0);
exports.Store = Store = __decorate([
    (0, typeorm_1.Entity)('stores')
], Store);
//# sourceMappingURL=store.entity.js.map