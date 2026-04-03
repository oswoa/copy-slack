import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserRecord } from "@/infrustructures/IUserDatabase";

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
        userId: string,
        email: string,
        displayName: string,
    ): Promise<UserRecordRepositoryResponse>;
}
