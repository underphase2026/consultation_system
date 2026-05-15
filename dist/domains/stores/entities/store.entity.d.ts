import { User } from '../../users/entities/user.entity';
import { StoreStaff } from './store-staff.entity';
export declare class Store {
    id: string;
    ownerId: string;
    storeBusinessName: string;
    storeName: string;
    businessRegistrationNumber: string;
    postcode: string;
    roadAddress: string;
    jibunAddress: string;
    detailedAddress: string;
    lat: number;
    lng: number;
    storePhone: string;
    storeCode: string;
    rate: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    owner: User;
    staffs: StoreStaff[];
}
