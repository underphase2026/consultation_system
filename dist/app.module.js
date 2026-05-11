"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./domains/auth/auth.module");
const users_module_1 = require("./domains/users/users.module");
const stores_module_1 = require("./domains/stores/stores.module");
const contracts_module_1 = require("./domains/contracts/contracts.module");
const crm_module_1 = require("./domains/crm/crm.module");
const public_data_module_1 = require("./infrastructure/public-data/public-data.module");
const database_module_1 = require("./infrastructure/database/database.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            database_module_1.DatabaseModule,
            public_data_module_1.PublicDataModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            stores_module_1.StoresModule,
            contracts_module_1.ContractsModule,
            crm_module_1.CrmModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map