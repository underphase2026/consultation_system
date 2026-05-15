import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';
import { LoginDto } from './dto/login.dto';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { RegisterStaffDto } from './dto/register-staff.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        role: Role;
        userId: string;
    }>;
    registerOwner(dto: RegisterOwnerDto, phoneVerifyToken: string): Promise<{
        userId: string;
        referralCode: string;
    }>;
    registerStaff(dto: RegisterStaffDto, phoneVerifyToken: string): Promise<{
        userId: string;
    }>;
    issueResetToken(phoneNumber: string): Promise<{
        resetToken: string;
    }>;
    forgotPassword(phoneNumber: string, dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    private generateSixDigitCode;
    private validatePhoneVerifyToken;
    private validateTerms;
}
