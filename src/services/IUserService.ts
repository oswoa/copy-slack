import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserRecord } from "@/infrustructures/IUserDatabase";

export type UserRecordsServiceResponse = {
    users: UserRecord[];
    errorDetail: ErrorDetail;
};

export interface IUserService {
    getUsersByDisplayName(displayName: string): Promise<UserRecordsServiceResponse>;
}
