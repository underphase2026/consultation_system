import { Store } from '../../stores/entities/store.entity';
import { ContractStatus } from '../enums/contract-status.enum';
export declare class Contract {
    id: string;
    storeId: string;
    customerName: string;
    customerPhone: string;
    electronicContractId: string;
    status: ContractStatus;
    signedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    store: Store;
}
