import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserDatabase, UserDatabaseWithSecrets } from "@/infrustructures/IAuthDatabase";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";

export type AuthRepositoryResponse = {
    user?: UserDatabase;
    errorDetail: ErrorDetail;
};

export type LoginRepositoryResponse = {
    user?: UserDatabaseWithSecrets;
    errorDetail: ErrorDetail;
};

export type LogoutRepositoryResponse = {
    user?: UserDatabase;
    errorDetail: ErrorDetail;
};

export interface IAuthRepository {
    auth(userId: string, token: string): Promise<AuthRepositoryResponse>;
    login(userId: string, password: string): Promise<LoginRepositoryResponse>;
    logout(): Promise<LogoutRepositoryResponse>;
}
