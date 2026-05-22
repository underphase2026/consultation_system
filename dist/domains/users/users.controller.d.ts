import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(): Promise<never[]>;
    getUserById(userId: string): Promise<{
        id: string;
    }>;
    getMe(user: User): Promise<{
        name: string;
        phoneNumber: string;
        birthDate: string;
        email: string;
        referralCode: string;
        marketingAgreed: boolean;
        role: Role;
    }>;
    updateMe(user: User, dto: UpdateUserDto): Promise<{
        name: string;
        phoneNumber: string;
        marketingAgreed: boolean;
    }>;
}
