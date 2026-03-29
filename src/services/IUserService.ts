import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserRecord } from "@/infrustructures/IUserDatabase";

export type UserRecordServiceResponse = {
    user?: UserRecord;
    errorDetail: ErrorDetail;
};

export type UserRecordsServiceResponse = {
    users: UserRecord[];
    errorDetail: ErrorDetail;
};

export interface IUserService {
    getUsersByDisplayName(displayName: string): Promise<UserRecordsServiceResponse>;
    updateUser(
        userId: string,
        email: string,
        displayName: string,
    ): Promise<UserRecordServiceResponse>;
}
