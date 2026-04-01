import bcrypt from "bcrypt";
import { IAuthDatabase } from "@/infrustructures/IAuthDatabase";
import {
    AuthRepositoryResponse,
    IAuthRepository,
    LoginRepositoryResponse,
    SignupRepositoryResponse,
} from "./IAuthRepository";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";

export class AuthRepository implements IAuthRepository {
    constructor(private db: IAuthDatabase) {}

    async auth(userId: string): Promise<AuthRepositoryResponse> {
        const res = await this.db.findByUserIdWithSecrets(userId);
        if (!res.errorDetail.success) {
            return { errorDetail: res.errorDetail };
        }

        const repositoryResponse: AuthRepositoryResponse = {
            user: res.user,
            errorDetail: res.errorDetail,
        };
        return repositoryResponse;
    }

    async login(userId: string, password: string): Promise<LoginRepositoryResponse> {
        const res = await this.db.findByUserIdWithSecrets(userId);
        if (!res.errorDetail.success) {
            return { errorDetail: res.errorDetail };
        }

        const isPasswordMatched = await bcrypt.compare(password, res.user!.password);
        if (!isPasswordMatched) {
            const errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_VALIDATION_INCORRECT_PASSWORD,
                ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_INCORRECT_PASSWORD,
                HttpStatusCode.Unauthorized,
            );
            return { errorDetail };
        }

        const repositoryResponse: LoginRepositoryResponse = {
            user: res.user,
            errorDetail: res.errorDetail,
        };
        return repositoryResponse;
    }

    async signup(
        userId: string,
        email: string,
        password: string,
    ): Promise<SignupRepositoryResponse> {
        return await this.db.create(userId, email, password);
    }
}
