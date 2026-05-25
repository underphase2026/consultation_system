import { AuthService } from './auth.service';
import { SmsAuthService } from './sms-auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { SendSmsDto, VerifySmsDto } from './dto/sms.dto';
export declare class AuthController {
    private readonly authService;
    private readonly smsAuthService;
    constructor(authService: AuthService, smsAuthService: SmsAuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        role: import("../../common/enums/role.enum").Role;
        userId: string;
    }>;
    registerOwner(authHeader: string, dto: RegisterOwnerDto): Promise<{
        userId: string;
        referralCode: string;
    }>;
    registerStaff(authHeader: string, dto: RegisterStaffDto): Promise<{
        userId: string;
    }>;
    private extractBearerToken;
    sendSmsCode(dto: SendSmsDto): Promise<{
        message: string;
    }>;
    verifySmsCode(dto: VerifySmsDto): Promise<{
        phoneVerifyToken: string;
        expiresIn: number;
    }>;
    issueResetToken(phoneNumber: string): Promise<{
        resetToken: string;
    }>;
    forgotPassword(resetUser: {
        phoneNumber: string;
    }, dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
}
