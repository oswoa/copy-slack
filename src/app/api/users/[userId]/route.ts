import { HttpStatusCode } from "axios";

import { ErrorDetailResponse } from "@/app/common/ErrorDetail";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

// APIがDBから受け取る際の型
type UserResponse = {
    id: string;
    email: string;
    token: string;
};

// APIレスポンス用
export type GetUserApiResponse = {
    user?: UserResponse;
    errorDetail?: ErrorDetailResponse;
};

/**
 * ユーザ取得API
 * @param param1 ユーザID
 * @returns ユーザ、エラー情報
 */
export async function GET(_: Request, { params }: { params: Promise<{ userId: string }> }) {
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let user: UserResponse | undefined;
    let errorDetail: ErrorDetailResponse | undefined;

    try {
        const { userId } = await params;
        const res = await fetch(`${BASE_URL}/users/${userId}`);
        switch (res.status) {
            case HttpStatusCode.Ok:
                user = await res.json();
                break;

            // ユーザが存在しないことを気づかせないため401を返す
            case HttpStatusCode.NotFound:
                errorDetail = {
                    errCode: ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
                    errMsg: ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED(),
                };
                status = HttpStatusCode.Unauthorized;
                console.error(errorDetail);
                break;
        }
    } catch (_) {
        errorDetail = {
            errCode: ERROR_CODES.ERROR_SERVER_UNKNOWN,
            errMsg: ERROR_MESSAGES.ERROR_SERVER_UNKNOWN(),
        };
        status = HttpStatusCode.InternalServerError;
        console.error(errorDetail);
    } finally {
        return Response.json({ user, errorDetail }, { status });
    }
}
