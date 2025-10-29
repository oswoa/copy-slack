import { HttpStatusCode } from "axios";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { ErrorDetailResponse } from "@/app/common/ErrorDetail";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

type ReqData = {
    id: string;
    password: string;
};

// APIがDBから受け取る際の型
type UserResponse = {
    id: string;
    email: string;
    token: string;
};

// APIレスポンス用
export type LoginApiResponse = {
    user?: UserResponse;
    errorDetail?: ErrorDetailResponse;
};

/**
 * ログインAPI
 * @param request ユーザID, パスワード
 * @returns ユーザ情報、エラー情報
 */
export async function POST(request: Request) {
    let user: UserResponse | undefined;
    let status: HttpStatusCode = HttpStatusCode.Unauthorized;
    let errorDetail: ErrorDetailResponse = {
        errCode: ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
        errMsg: ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED(),
    };

    try {
        const { id, password }: ReqData = await request.json();
        const res = await fetch(`${BASE_URL}/users/${id}`);

        switch (res.status) {
            case HttpStatusCode.Ok:
                // UserResponseはpasswordを保持してないため一時的に付与
                const validator: UserResponse & { password: string } = await res.json();
                const isValid = await bcrypt.compare(password, validator.password);
                if (isValid) {
                    user = {
                        id: validator.id,
                        email: validator.email,
                        token: validator.token,
                    };
                    status = HttpStatusCode.Ok;
                    const apiResponse = NextResponse.json({ user, undefined }, { status });

                    apiResponse.cookies.set("userId", user.id, {
                        path: "/",
                        httpOnly: true,
                        sameSite: "strict",
                    });
                    apiResponse.cookies.set("token", user.token, {
                        path: "/",
                        httpOnly: true,
                        sameSite: "strict",
                    });
                    return apiResponse;
                }
                break;

            // ユーザがいない事を気づかせないため、401でそのまま返す
            case HttpStatusCode.NotFound:
                break;
        }
        console.error(errorDetail);
        return NextResponse.json({ user, errorDetail }, { status });
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
