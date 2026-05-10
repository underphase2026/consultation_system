"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let code = 'INTERNAL_ERROR';
        let message = '서버 내부 오류가 발생했습니다.';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exRes = exception.getResponse();
            if (typeof exRes === 'object' && exRes !== null) {
                const body = exRes;
                const rawMessage = body['message'];
                code = body['code'] ?? this.statusToCode(status);
                message = Array.isArray(rawMessage)
                    ? rawMessage.join(', ')
                    : (rawMessage ?? exception.message);
            }
            else {
                code = this.statusToCode(status);
                message = String(exRes);
            }
        }
        else {
            this.logger.error('Unhandled exception', exception);
        }
        response.status(status).json({
            success: false,
            error: { code, message },
        });
    }
    statusToCode(status) {
        const map = {
            400: 'VALIDATION_ERROR',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            502: 'EXTERNAL_API_ERROR',
        };
        return map[status] ?? 'INTERNAL_ERROR';
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map