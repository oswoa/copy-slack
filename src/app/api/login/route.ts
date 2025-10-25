import { ErrorDetail } from "@/app/common/ErrorDetail";
import { User } from "@/app/common/User";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";
import { NextResponse } from "next/server";

type ReqData = {
    id: string;
    password: string;
};

type UserResponse = {
    id: string;
    email: string;
    password: string;
    token: string;
};

/**
 * ログインAPI
 * @param request ユーザID, パスワード
 * @returns ユーザ情報、エラー情報
 */
export async function POST(request: Request) {
    let status: HttpStatusCode = HttpStatusCode.Ok;

    try {
        const { id, password }: ReqData = await request.json();
        const res = await fetch(`${BASE_URL}/users/${id}`);

        switch (res.status) {
            case HttpStatusCode.Ok:
                const resData: UserResponse = await res.json();

                if (resData.id === id && resData.password === password) {
                    const user: User = new User(resData.id, resData.email, resData.token);
                    const apiResponse = NextResponse.json({ user, undefined }, { status });

                    apiResponse.cookies.set("userId", resData.id, {
                        path: "/",
                        httpOnly: true,
                        sameSite: "strict",
                    });
                    apiResponse.cookies.set("token", resData.token, {
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

        const errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
            ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED()
        );
        status = HttpStatusCode.Unauthorized;
        return NextResponse.json({ undefined, errorDetail }, { status });
    } catch (_) {
        const errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_UNKNOWN,
            ERROR_MESSAGES.ERROR_SERVER_UNKNOWN()
        );
        status = HttpStatusCode.InternalServerError;
        return NextResponse.json({ undefined, errorDetail }, { status });
    }
}
