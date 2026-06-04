import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getAllUsers(): Promise<never[]>;
    getMe(user: User): Promise<{
        id: string;
        name: string;
        phoneNumber: string;
        birthDate: string;
        email: string;
        referralCode: string;
        marketingAgreed: boolean;
        role: Role;
    }>;
    getUserById(userId: string): Promise<{
        id: string;
    }>;
    updateMe(user: User, dto: UpdateUserDto): Promise<{
        name: string;
        phoneNumber: string;
        marketingAgreed: boolean;
    }>;
}
