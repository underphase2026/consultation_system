import { User } from './interfaces/user.interface';
import { Role } from '../../common/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly store;
    generateReferralCode(): string;
    private isReferralCodeUsed;
    findByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
    findById(id: string): Promise<User | undefined>;
    create(data: {
        name: string;
        phoneNumber: string;
        email?: string;
        password: string;
        role: Role;
        marketingAgreed: boolean;
    }): Promise<User>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    updatePasswordByPhone(phoneNumber: string, newPassword: string): Promise<void>;
    validatePassword(user: User, plain: string): Promise<boolean>;
}
