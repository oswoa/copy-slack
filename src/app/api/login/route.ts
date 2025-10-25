import { ErrorDetail } from "@/app/common/ErrorDetail";
import { User } from "@/app/common/User";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type UserResponse = {
    id: string;
    email: string;
    password: string;
    token: string;
};

type ReqData = {
    id: string;
    password: string;
};

/**
 * ログインAPI
 * @param request ユーザID, パスワード
 * @returns ユーザ情報、エラー情報
 */
export async function POST(request: Request) {
    let status: HttpStatusCode = HttpStatusCode.Ok;

    try {
        const reqData: ReqData = await request.json();
        const reqUserId = reqData.id;
        const reqPassword = reqData.password;
        const res = await fetch(`${BASE_URL}/users/${reqUserId}`);

        switch (res.status) {
            case HttpStatusCode.Ok:
                const cookieStore = await cookies();
                const token = cookieStore.get("token");

                const resData: UserResponse = await res.json();
                if (
                    resData.id === reqUserId &&
                    resData.password === reqPassword &&
                    resData.token === token?.value
                ) {
                    const user: User = new User(resData.id, resData.email, resData.token);
                    const apiResponse = NextResponse.json({ user, undefined }, { status });
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
