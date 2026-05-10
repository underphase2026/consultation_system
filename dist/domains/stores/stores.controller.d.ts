import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { JoinStoreDto } from './dto/join-store.dto';
import type { User } from '../users/interfaces/user.interface';
export declare class StoresController {
    private readonly storesService;
    constructor(storesService: StoresService);
    getMyStores(user: User): Promise<{
        storeId: string;
        storeName: string;
        address: string;
        rate: string | null;
        ownerName: string;
        phoneNumber: string;
    }[]>;
    createStore(user: User, dto: CreateStoreDto): Promise<{
        storeId: string;
        storeName: string;
        storeCode: string;
    }>;
    joinStore(user: User, dto: JoinStoreDto): Promise<{
        storeId: string;
        storeName: string;
    }>;
}
