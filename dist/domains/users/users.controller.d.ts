import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import type { User } from './interfaces/user.interface';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: User): Promise<{
        name: string;
        phoneNumber: string;
        birthDate: string | null;
        email: string | null;
        referralCode: string;
        marketingAgreed: boolean;
        role: import("../../common/enums/role.enum").Role;
    }>;
    updateMe(user: User, dto: UpdateUserDto): Promise<{
        name: string;
        phoneNumber: string;
        marketingAgreed: boolean;
    }>;
}
