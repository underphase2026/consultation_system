import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { StoreStaff } from './entities/store-staff.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { JoinStoreDto } from './dto/join-store.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';
import type { IBusinessVerifyService } from '../../infrastructure/public-data/interfaces/business-verify.interface';
export declare class StoresService {
    private readonly storeRepository;
    private readonly storeStaffRepository;
    private readonly usersService;
    private readonly businessVerifyService;
    constructor(storeRepository: Repository<Store>, storeStaffRepository: Repository<StoreStaff>, usersService: UsersService, businessVerifyService: IBusinessVerifyService);
    getMyStores(userId: string, role: Role): Promise<{
        storeId: string;
        storeName: string;
        address: string;
        rate: string;
        ownerName: string;
        phoneNumber: string;
    }[]>;
    createStore(ownerId: string, dto: CreateStoreDto): Promise<{
        storeId: string;
        storeName: string;
        storeCode: string;
    }>;
    verifyBusinessNumber(businessNumber: string): Promise<{
        valid: boolean;
        status: string;
    }>;
    joinStore(staffId: string, dto: JoinStoreDto): Promise<{
        storeId: string;
        storeName: string;
    }>;
    private generateStoreCode;
}
