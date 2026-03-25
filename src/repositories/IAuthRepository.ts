import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserRecord, UserRecordWithSecrets } from "@/infrustructures/IUserDatabase";

export type AuthRepositoryResponse = {
    user?: UserRecord;
    errorDetail: ErrorDetail;
};

export type LoginRepositoryResponse = {
    user?: UserRecordWithSecrets;
    errorDetail: ErrorDetail;
};

export type LogoutRepositoryResponse = {
    user?: UserRecord;
    errorDetail: ErrorDetail;
};

export interface IAuthRepository {
    auth(userId: string, token: string): Promise<AuthRepositoryResponse>;
    login(userId: string, password: string): Promise<LoginRepositoryResponse>;
}
