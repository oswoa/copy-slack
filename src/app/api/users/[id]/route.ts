import { ErrorDetail } from "@/app/common/ErrorDetail";
import { User } from "@/app/common/User";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";

/**
 * ユーザ照会API
 * @param param1 ユーザID
 * @returns ユーザ、エラー情報
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
    let user: User | undefined;
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let errorDetail: ErrorDetail | undefined;

    try {
        const { id } = await params;
        const res = await fetch(`${BASE_URL}/users/${id}`);
        switch (res.status) {
            case HttpStatusCode.Ok:
                const data: User = await res.json();
                user = new User(data.id, data.token);
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
