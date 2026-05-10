export interface Store {
    id: string;
    ownerId: string;
    storeBusinessName: string;
    storeName: string;
    businessRegistrationNumber: string;
    postcode: string;
    detailedAddress: string;
    storePhonenumber?: string;
    storeCode: string;
    rate?: string;
    staffIds: string[];
    createdAt: Date;
}
