import { User } from './user.entity';
export declare class UserTerm {
    userId: string;
    serviceAgreed: boolean;
    privacyAgreed: boolean;
    marketingAgreed: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
