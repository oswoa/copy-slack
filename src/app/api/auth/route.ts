import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

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
export type AuthApiresponse = {
    user?: UserResponse;
    errorDetail?: ErrorDetailResponse;
};

/**
 * ユーザ認証API
 * @param request cookie
 * @returns ユーザ情報、エラー情報
 */
export async function GET(request: NextRequest) {
    let status: HttpStatusCode = HttpStatusCode.Unauthorized;
    let user: UserResponse | undefined;
    let errorDetail: ErrorDetailResponse = {
        errCode: ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
        errMsg: ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED(),
    };

    try {
        const hasToken = request.cookies.has("token");
        const hasUserId = request.cookies.has("userId");
        if (!hasToken || !hasUserId) {
            console.error(errorDetail);
            return NextResponse.json({ user, errorDetail }, { status });
        }

        const token = request.cookies.get("token");
        const userId = request.cookies.get("userId");
        if (token!.value.length === 0 || userId!.value.length === 0) {
            console.error(errorDetail);
            return NextResponse.json({ user, errorDetail }, { status });
        }

        const res = await fetch(`${BASE_URL}/users/${userId!.value}`);
        switch (res.status) {
            case HttpStatusCode.Ok:
                user = await res.json();
                if (!user) {
                    errorDetail = {
                        errCode: ERROR_CODES.ERROR_SERVER_UNKNOWN,
                        errMsg: ERROR_MESSAGES.ERROR_SERVER_UNKNOWN(),
                    };
                    status = HttpStatusCode.InternalServerError;
                    console.error(errorDetail);
                    return NextResponse.json({ user, errorDetail }, { status });
                }
                if (user.token !== token!.value) {
                    console.error(errorDetail);
                    return NextResponse.json({ user, errorDetail }, { status });
                }
                status = HttpStatusCode.Ok;
                return NextResponse.json({ user, undefined }, { status });

            default:
                console.error(errorDetail);
                return NextResponse.json({ user, errorDetail }, { status });
        }
    } catch (_) {
        errorDetail = {
            errCode: ERROR_CODES.ERROR_SERVER_UNKNOWN,
            errMsg: ERROR_MESSAGES.ERROR_SERVER_UNKNOWN(),
        };
        status = HttpStatusCode.InternalServerError;
        console.error(errorDetail);
        return NextResponse.json({ user, errorDetail }, { status });
    }
}
