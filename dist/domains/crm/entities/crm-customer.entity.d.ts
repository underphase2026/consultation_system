export declare enum CrmCustomerStatus {
    CONSULTING = "CONSULTING",
    CONTRACT_COMPLETED = "CONTRACT_COMPLETED",
    ACTIVATION_PENDING = "ACTIVATION_PENDING"
}
export declare class CrmCustomer {
    id: string;
    storeId: string;
    name: string;
    phone: string;
    status: CrmCustomerStatus;
    lastContractDate: Date;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}
