import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserRecord, UserRecordWithSecrets } from "@/infrustructures/IUserDatabase";

export type UserRecordsRepositoryResponse = {
    users: UserRecord[];
    errorDetail: ErrorDetail;
};

export interface IUserRepository {
    getUsersByDisplayName(displayName: string): Promise<UserRecordsRepositoryResponse>;
}
