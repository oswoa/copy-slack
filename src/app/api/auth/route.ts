import { ErrorDetail } from "@/app/common/ErrorDetail";
import { User } from "@/app/common/User";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

type UserResponse = {
    id: string;
    email: string;
    password: string;
    token: string;
};

/**
 * ユーザ認証API
 * @param request cookie
 * @returns ユーザ情報、エラー情報
 */
export async function GET(request: NextRequest) {
    let status: HttpStatusCode = HttpStatusCode.Unauthorized;
    let errorDetail = new ErrorDetail(
        ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
        ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED()
    );

    try {
        const hasToken = request.cookies.has("token");
        const hasUserId = request.cookies.has("userId");
        if (!hasToken || !hasUserId) {
            return NextResponse.json({ undefined, errorDetail }, { status });
        }

        const token = request.cookies.get("token");
        const userId = request.cookies.get("userId");
        if (token!.value.length === 0 || userId!.value.length === 0) {
            return NextResponse.json({ undefined, errorDetail }, { status });
        }

        // 指定されたIDのユーザが保持するトークンとcookie内のトークンが一致するか確認
        const res = await fetch(`${BASE_URL}/users/${userId!.value}`);

        switch (res.status) {
            case HttpStatusCode.Ok:
                const resData: UserResponse = await res.json();
                if (resData.token !== token!.value) {
                    return NextResponse.json({ undefined, errorDetail }, { status });
                }

                const user = new User(resData.id, resData.email, resData.token);
                status = HttpStatusCode.Ok;
                return NextResponse.json({ user, undefined }, { status });

            default:
                return NextResponse.json({ undefined, errorDetail }, { status });
        }
    } catch (_) {
        errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_UNKNOWN,
            ERROR_MESSAGES.ERROR_SERVER_UNKNOWN()
        );
        status = HttpStatusCode.InternalServerError;
        return NextResponse.json({ undefined, errorDetail }, { status });
    }
}
