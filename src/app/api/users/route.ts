import { ErrorDetail } from "@/app/common/ErrorDetail";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";

/**
 * ユーザ登録API
 * @param request リクエストパラメータ
 * @returns エラー情報
 */
export async function POST(request: Request) {
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let errorDetail: ErrorDetail | undefined;

    try {
        const formData = await request.json();
        await fetch(`${BASE_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
    } catch (_) {
        errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_UNKNOWN,
            ERROR_MESSAGES.ERROR_SERVER_UNKNOWN()
        );
        status = HttpStatusCode.InternalServerError;
    } finally {
        return Response.json({ errorDetail }, { status });
    }
}
