import { NextRequest, NextResponse } from "next/server";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { authService } from "@/app/lib/init";
import { UserRecord } from "@/infrastructures/user/IUserDatabase";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";

// APIレスポンス用
export type AuthApiResponse = {
    user?: UserRecord;
    workspaceId?: string;
    channelId?: string;
    errorDetail: ErrorDetail;
};

/**
 * ユーザ認証API
 * @param request cookie
 * @returns エラー情報
 */
export async function GET(request: NextRequest) {
    const errorDetail: ErrorDetail = new ErrorDetail(
        ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
        ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED,
        HttpStatusCode.Unauthorized,
    );

    const cookies = request.cookies;
    const hasToken = cookies.has("token");
    const hasUserId = cookies.has("userId");
    if (!hasToken || !hasUserId) {
        return NextResponse.json<AuthApiResponse>({ errorDetail }, { status: errorDetail.status });
    }

    const token = cookies.get("token");
    const userId = cookies.get("userId");
    if (token!.value.length === 0 || userId!.value.length === 0) {
        return NextResponse.json<AuthApiResponse>({ errorDetail }, { status: errorDetail.status });
    }

    const serviceResponse = await authService.auth(userId!.value, token!.value);
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<AuthApiResponse>(
            { errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<AuthApiResponse>(
        {
            user: serviceResponse.user,
            workspaceId: serviceResponse.workspaceId,
            channelId: serviceResponse.channelId,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
}
