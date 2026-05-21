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
export async function POST(request: NextRequest) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let status: HttpStatusCode = HttpStatusCode.Ok;

    try {
        const apiResponse = NextResponse.json({ errorDetail } as LogoutApiResponse, { status });

        const hasUserId = request.cookies.has("userId");
        const hasSlackToken = request.cookies.has("slackToken");
        if (!hasUserId || !hasSlackToken) {
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_UNKNOWN,
                ERROR_MESSAGES.ERROR_SERVER_UNKNOWN,
                HttpStatusCode.InternalServerError,
            );
            return NextResponse.json({ errorDetail }, { status: errorDetail.status });
        }

        apiResponse.cookies.delete("userId");
        apiResponse.cookies.delete("slackToken");
        return apiResponse;
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
        return NextResponse.json({ errorDetail }, { status: errorDetail.status });
    }
}
