import { ErrorDetail } from "@/app/common/ErrorDetail";
import { User } from "@/app/common/User";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";

type UserResponse = {
    id: string;
    password: string;
    token: string;
};

/**
 * ログインAPI
 * @param request ユーザID, パスワード、トークン
 * @returns ユーザ、エラー情報
 */
export async function POST(request: Request) {
    let user: User | undefined;
    let status: HttpStatusCode = HttpStatusCode.Unauthorized;
    let errorDetail: ErrorDetail | undefined;

    try {
        const { id, password, token } = await request.json();
        const res = await fetch(`${BASE_URL}/users/${id}`);

        switch (res.status) {
            case HttpStatusCode.Ok:
                const data: UserResponse = await res.json();
                if (data.id === id && data.password === password && data.token === token) {
                    user = new User(data.id, data.token);
                    status = HttpStatusCode.Ok;
                } else {
                    errorDetail = new ErrorDetail(
                        ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
                        ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED()
                    );
                }
                break;

            case HttpStatusCode.NotFound:
                // ユーザがいない事を気づかせないため、401で返す
                errorDetail = new ErrorDetail(
                    ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
                    ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED()
                );
                break;
        }
    } catch (_) {
        errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_UNKNOWN,
            ERROR_MESSAGES.ERROR_SERVER_UNKNOWN()
        );
        status = HttpStatusCode.InternalServerError;
    } finally {
        return Response.json({ user, errorDetail }, { status });
    }
}
