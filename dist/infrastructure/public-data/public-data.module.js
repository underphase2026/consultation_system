"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicDataModule = void 0;
const common_1 = require("@nestjs/common");
const public_data_service_1 = require("./public-data.service");
const business_verify_interface_1 = require("./interfaces/business-verify.interface");
let PublicDataModule = class PublicDataModule {
};
exports.PublicDataModule = PublicDataModule;
exports.PublicDataModule = PublicDataModule = __decorate([
    (0, common_1.Module)({
        providers: [
            public_data_service_1.PublicDataService,
            {
                provide: business_verify_interface_1.BUSINESS_VERIFY_SERVICE,
                useClass: public_data_service_1.PublicDataService,
            },
        ],
        exports: [business_verify_interface_1.BUSINESS_VERIFY_SERVICE, public_data_service_1.PublicDataService],
    })
], PublicDataModule);
//# sourceMappingURL=public-data.module.js.map