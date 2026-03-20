import bcrypt from "bcrypt";
import { IAuthDatabase } from "@/infrustructures/IAuthDatabase";
import {
    AuthRepositoryResponse,
    IAuthRepository,
    LoginRepositoryResponse,
    LogoutRepositoryResponse,
} from "./IAuthRepository";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";

export class AuthRepository implements IAuthRepository {
    constructor(private db: IAuthDatabase) {}

    async auth(userId: string, token: string): Promise<AuthRepositoryResponse> {
        const errorDetail: ErrorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
            ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED,
        );

        const res = await this.db.findByUserIdWithSecrets(userId);
        if (!res.errorDetail.success || res.user?.token !== token) {
            return { errorDetail };
        }

        const repositoryResponse: AuthRepositoryResponse = {
            user: {
                userId: res.user.userId,
                email: res.user.email,
                displayName: res.user.displayName,
            },
            errorDetail: res.errorDetail,
        };
        return repositoryResponse;
    }

    async login(userId: string, password: string): Promise<LoginRepositoryResponse> {
        const res = await this.db.findByUserIdWithSecrets(userId);
        if (!res.errorDetail.success) {
            return { errorDetail: res.errorDetail };
        }

        if (!res.user) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_VALIDATION_INCORRECT_PASSWORD,
                ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_INCORRECT_PASSWORD,
            );
            return { errorDetail };
        }

        const isPasswordMatched = await bcrypt.compare(password, res.user.password);
        if (!isPasswordMatched) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_VALIDATION_INCORRECT_PASSWORD,
                ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_INCORRECT_PASSWORD,
            );
            return { errorDetail };
        }

        const repositoryResponse: LoginRepositoryResponse = {
            user: {
                userId: res.user.userId,
                email: res.user.email,
                displayName: res.user.displayName,
                token: res.user.token,
                password: res.user.password,
            },
            errorDetail: res.errorDetail,
        };
        return repositoryResponse;
    }

    async logout(): Promise<LogoutRepositoryResponse> {
        throw new Error("not implemented");
    }
}
