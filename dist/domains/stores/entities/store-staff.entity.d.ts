import { User } from '../../users/entities/user.entity';
import { Store } from './store.entity';
export declare class StoreStaff {
    id: string;
    userId: string;
    storeId: string;
    joinedAt: Date;
    user: User;
    store: Store;
}
