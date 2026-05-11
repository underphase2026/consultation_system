import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    generateReferralCode(): Promise<string>;
    private isReferralCodeUsed;
    findByPhoneNumber(phoneNumber: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: {
        name: string;
        phoneNumber: string;
        email?: string;
        password: string;
        role: Role;
        terms: {
            serviceAgreed: boolean;
            privacyAgreed: boolean;
            marketingAgreed: boolean;
        };
    }): Promise<User>;
    update(id: string, dto: UpdateUserDto): Promise<User>;
    updatePasswordByPhone(phoneNumber: string, newPassword: string): Promise<void>;
    validatePassword(user: User, plain: string): Promise<boolean>;
}
