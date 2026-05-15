import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { JoinStoreDto } from './dto/join-store.dto';
import { BusinessVerifyDto } from './dto/business-verify.dto';
import { GeocodeQueryDto } from './dto/geocode-query.dto';
import { User } from '../users/entities/user.entity';
export declare class StoresController {
    private readonly storesService;
    constructor(storesService: StoresService);
    getMyStores(user: User): Promise<{
        storeId: string;
        storeName: string;
        address: string;
        rate: string;
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
    verifyBusinessNumber(dto: BusinessVerifyDto): Promise<{
        valid: boolean;
        status: string;
    }>;
    geocodeAddress(query: GeocodeQueryDto): Promise<{
        addressName: any;
        roadAddress: any;
        jibunAddress: any;
        lat: number;
        lng: number;
    }>;
}
