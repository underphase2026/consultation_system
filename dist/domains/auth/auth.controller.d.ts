import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        role: import("../../common/enums/role.enum").Role;
        userId: string;
    }>;
    registerOwner(dto: RegisterOwnerDto): Promise<{
        userId: string;
        referralCode: string;
    }>;
    registerStaff(dto: RegisterStaffDto): Promise<{
        userId: string;
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
