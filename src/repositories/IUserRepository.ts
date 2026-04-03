import { ErrorDetail } from "@/app/common/ErrorDetail";
import { TransactionClient } from "@/app/lib/init";
import { UserRecord } from "@/infrastructures/IUserDatabase";

export type UserRecordRepositoryResponse = {
    user?: UserRecord;
    errorDetail: ErrorDetail;
};

export type UserRecordsRepositoryResponse = {
    users: UserRecord[];
    errorDetail: ErrorDetail;
};

export interface IUserRepository {
    getUsersByDisplayName(displayName: string): Promise<UserRecordsRepositoryResponse>;
    updateUser(
        tx: TransactionClient,
        userId: string,
        email: string,
        displayName: string,
    ): Promise<UserRecordRepositoryResponse>;
}
