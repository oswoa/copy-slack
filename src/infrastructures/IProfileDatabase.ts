import { ErrorDetail } from "@/app/common/ErrorDetail";
import { TransactionClient } from "@/app/lib/init";

export type ProfileRecord = {
    profileId: string;
    userId: string;
    imageUrl: string;
};

export type ProfileDatabaseResponse = {
    profile?: ProfileRecord;
    errorDetail: ErrorDetail;
};

export interface IProfileDatabase {
    findByUserId(userId: string): Promise<ProfileDatabaseResponse>;
    update(tx: TransactionClient, userId: string, file: File): Promise<ProfileDatabaseResponse>;
}
