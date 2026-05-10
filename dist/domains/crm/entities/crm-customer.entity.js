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
exports.CrmCustomer = void 0;
const typeorm_1 = require("typeorm");
let CrmCustomer = class CrmCustomer {
    id;
    storeId;
    name;
    phone;
    lastContractDate;
    createdAt;
    updatedAt;
};
exports.CrmCustomer = CrmCustomer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CrmCustomer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'store_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], CrmCustomer.prototype, "storeId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CrmCustomer.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CrmCustomer.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'last_contract_date', nullable: true }),
    __metadata("design:type", Date)
], CrmCustomer.prototype, "lastContractDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CrmCustomer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CrmCustomer.prototype, "updatedAt", void 0);
exports.CrmCustomer = CrmCustomer = __decorate([
    (0, typeorm_1.Entity)('crm_customers'),
    (0, typeorm_1.Index)(['storeId', 'phone'], { unique: true })
], CrmCustomer);
//# sourceMappingURL=crm-customer.entity.js.map