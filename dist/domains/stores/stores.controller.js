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
exports.StoresController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stores_service_1 = require("./stores.service");
const create_store_dto_1 = require("./dto/create-store.dto");
const join_store_dto_1 = require("./dto/join-store.dto");
const business_verify_dto_1 = require("./dto/business-verify.dto");
const geocode_query_dto_1 = require("./dto/geocode-query.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const user_entity_1 = require("../users/entities/user.entity");
const store_response_dto_1 = require("./dto/store-response.dto");
let StoresController = class StoresController {
    storesService;
    constructor(storesService) {
        this.storesService = storesService;
    }
    getMyStores(user) {
        return this.storesService.getMyStores(user.id, user.role);
    }
    createStore(user, dto) {
        return this.storesService.createStore(user.id, dto);
    }
    joinStore(user, dto) {
        return this.storesService.joinStore(user.id, dto);
    }
    verifyBusinessNumber(dto) {
        return this.storesService.verifyBusinessNumber(dto.businessRegistrationNumber);
    }
    geocodeAddress(query) {
        return this.storesService.geocodeAddress(query.address);
    }
};
exports.StoresController = StoresController;
__decorate([
    (0, common_1.Get)('mine'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.OWNER, role_enum_1.Role.STAFF),
    (0, swagger_1.ApiOperation)({ summary: '내 매장 조회' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '매장 목록 반환', type: [store_response_dto_1.StoreItemResponseDto] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "getMyStores", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.OWNER),
    (0, swagger_1.ApiOperation)({ summary: '매장 등록 (OWNER 전용)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '매장 생성 완료, storeCode 반환', type: store_response_dto_1.CreateStoreResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, create_store_dto_1.CreateStoreDto]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "createStore", null);
__decorate([
    (0, common_1.Post)('join'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.STAFF),
    (0, swagger_1.ApiOperation)({ summary: '매장 합류 (STAFF 전용, storeCode 입력)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '합류 완료', type: store_response_dto_1.JoinStoreResponseDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, join_store_dto_1.JoinStoreDto]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "joinStore", null);
__decorate([
    (0, common_1.Post)('business-verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.OWNER),
    (0, swagger_1.ApiOperation)({ summary: '사업자 번호 진위 확인 (OWNER 전용)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '유효한 사업자 번호' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [business_verify_dto_1.BusinessVerifyDto]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "verifyBusinessNumber", null);
__decorate([
    (0, common_1.Get)('geocode'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(role_enum_1.Role.OWNER, role_enum_1.Role.STAFF),
    (0, swagger_1.ApiOperation)({ summary: '주소로 위경도 좌표 변환 (카카오 로컬 API 연동)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '변환된 좌표 데이터 반환', type: store_response_dto_1.GeocodeResponseDto }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [geocode_query_dto_1.GeocodeQueryDto]),
    __metadata("design:returntype", void 0)
], StoresController.prototype, "geocodeAddress", null);
exports.StoresController = StoresController = __decorate([
    (0, swagger_1.ApiTags)('Stores'),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('stores'),
    __metadata("design:paramtypes", [stores_service_1.StoresService])
], StoresController);
//# sourceMappingURL=stores.controller.js.map