import { CreateStoreDto } from './dto/create-store.dto';
import { JoinStoreDto } from './dto/join-store.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';
import type { IBusinessVerifyService } from '../../infrastructure/public-data/interfaces/business-verify.interface';
export declare class StoresService {
    private readonly usersService;
    private readonly businessVerifyService;
    private readonly store;
    private readonly staffStoreIndex;
    constructor(usersService: UsersService, businessVerifyService: IBusinessVerifyService);
    getMyStores(userId: string, role: Role): Promise<{
        storeId: string;
        storeName: string;
        address: string;
        rate: string | null;
        ownerName: string;
        phoneNumber: string;
    }[]>;
    private formatStores;
    createStore(ownerId: string, dto: CreateStoreDto): Promise<{
        storeId: string;
        storeName: string;
        storeCode: string;
    }>;
    joinStore(staffId: string, dto: JoinStoreDto): Promise<{
        storeId: string;
        storeName: string;
    }>;
    private generateStoreCode;
}
