import { Role } from '../../../common/enums/role.enum';
import { UserTerm } from './user-term.entity';
import { Store } from '../../stores/entities/store.entity';
import { StoreStaff } from '../../stores/entities/store-staff.entity';
export declare class User {
    id: string;
    phoneNumber: string;
    password: string;
    name: string;
    email: string;
    birthDate: string;
    role: Role;
    referralCode: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    terms: UserTerm;
    ownedStores: Store[];
    storeStaffs: StoreStaff[];
}
