import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";

// APIレスポンス用
export type LogoutApiResponse = {
    errorDetail?: ErrorDetail;
};

/**
 * ログアウトAPI
 * @returns エラー情報
 */
export async function POST(_: NextRequest) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let status: HttpStatusCode = HttpStatusCode.Ok;

    try {
        const response = NextResponse.json({ errorDetail }, { status });

        const hasUserId = response.cookies.has("userId");
        const hasToken = response.cookies.has("token");
        if (!hasUserId || !hasToken) {
            status = HttpStatusCode.InternalServerError;
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_UNKNOWN,
                ERROR_MESSAGES.ERROR_SERVER_UNKNOWN
            );
            return NextResponse.json({ errorDetail }, { status });
        }

        response.cookies.delete("userId");
        response.cookies.delete("token");
        return response;
    } catch (error) {
        status = HttpStatusCode.InternalServerError;
        errorDetail = ErrorDetail.getFromPrismaError(error);
        return NextResponse.json({ errorDetail }, { status });
    }
}
