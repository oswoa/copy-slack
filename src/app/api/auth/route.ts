import { ErrorDetail } from "@/app/common/ErrorDetail";
import { User } from "@/app/common/User";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";

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
        const isTokenContained = request.cookies.has("token");
        const isUserIdContained = request.cookies.has("userId");
        if (!isTokenContained || !isUserIdContained) {
            return NextResponse.json({ undefined, errorDetail }, { status });
        }

        const token = request.cookies.get("token");
        const userId = request.cookies.get("userId");
        if (token!.value.length === 0 || userId!.value.length === 0) {
            return NextResponse.json({ undefined, errorDetail }, { status });
        }

        // 指定されたIDのユーザが保持するトークンとcookie内のトークンが一致するか確認
        const res = await fetch(`${BASE_URL}/users/${userId!.value}`);
        const resData = await res.json();

        const user = User.getUserFromJson(resData.user);
        if (!user || user.token !== token!.value) {
            return NextResponse.json({ undefined, errorDetail }, { status });
        }

        status = HttpStatusCode.Ok;
        return NextResponse.json({ user, undefined }, { status });
    } catch (_) {
        errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_UNKNOWN,
            ERROR_MESSAGES.ERROR_SERVER_UNKNOWN()
        );
        status = HttpStatusCode.InternalServerError;
        return NextResponse.json({ undefined, errorDetail }, { status });
    }
}
