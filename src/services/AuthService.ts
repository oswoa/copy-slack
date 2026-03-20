import { ErrorDetail } from "@/app/common/ErrorDetail";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import {
    AuthServiceResponse,
    IAuthService,
    LoginServiceRequest,
    LoginServiceResponse,
} from "./IAuthService";
import { IAuthRepository } from "@/repositories/IAuthRepository";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";

export class AuthService implements IAuthService {
    constructor(private repository: IAuthRepository) {}

    async auth(cookies: RequestCookies): Promise<AuthServiceResponse> {
        const errorDetail: ErrorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
            ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED,
        );

        const hasToken = cookies.has("token");
        const hasUserId = cookies.has("userId");
        if (!hasToken || !hasUserId) {
            return { errorDetail };
        }

        const token = cookies.get("token");
        const userId = cookies.get("userId");
        if (token!.value.length === 0 || userId!.value.length === 0) {
            return { errorDetail };
        }

        return await this.repository.auth(userId!.value, token!.value);
    }

    async login(request: LoginServiceRequest): Promise<LoginServiceResponse> {
        return await this.repository.login(request.userId, request.password);
    }
}
