import { ErrorDetail } from "@/app/common/ErrorDetail";
import { User } from "@/app/common/User";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";

type UserResponse = {
    id: string;
    email: string;
    password: string;
    token: string;
};

/**
 * ユーザ照会API
 * @param param1 ユーザID
 * @returns ユーザ、エラー情報
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let errorDetail: ErrorDetail | undefined;
    let user: User | undefined;

    try {
        const { id } = await params;
        const resData = await fetch(`${BASE_URL}/users/${id}`);
        switch (resData.status) {
            case HttpStatusCode.Ok:
                const data: UserResponse = await resData.json();
                user = new User(data.id, data.email, data.token);
                break;

            case HttpStatusCode.NotFound:
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
