import { ErrorDetail } from "@/app/common/ErrorDetail";
import { TransactionClient } from "@/app/lib/init";
import { UserRecord, UserRecordWithSecrets } from "@/infrastructures/user/IUserDatabase";

export type AuthRepositoryResponse = {
    user?: UserRecordWithSecrets;
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

export type SignupRepositoryResponse = {
    user?: UserRecordWithSecrets;
    errorDetail: ErrorDetail;
};

export interface IAuthRepository {
    auth(userId: string): Promise<AuthRepositoryResponse>;
    login(userId: string, password: string): Promise<LoginRepositoryResponse>;
    signup(
        tx: TransactionClient,
        userId: string,
        email: string,
        password: string,
    ): Promise<SignupRepositoryResponse>;
}
