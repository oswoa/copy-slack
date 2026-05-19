import { ErrorDetail } from "@/app/common/ErrorDetail";
import { TransactionClient } from "@/app/lib/init";
import { ProfileRecord } from "@/infrastructures/profile/IProfileDatabase";

export type ProfileRepositoryResponse = {
    profile?: ProfileRecord;
    errorDetail: ErrorDetail;
};

export interface IProfileRepository {
    getProfile(userId: string): Promise<ProfileRepositoryResponse>;
    updateProfile(
        tx: TransactionClient,
        userId: string,
        file: File,
    ): Promise<ProfileRepositoryResponse>;
}
