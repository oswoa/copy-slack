import { ErrorDetail } from "@/app/common/ErrorDetail";
import { User } from "@/app/common/User";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";
import { NextResponse } from "next/server";
import { uuidv7 } from "uuidv7";

type UserResponse = {
    id: string;
    email: string;
    password: string;
    token: string;
};

/**
 * ユーザ情報一覧取得API
 * DBに登録されているユーザ情報一覧をDBから取得
 * @returns ユーザ情報一覧、エラー情報
 */
export async function GET() {
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let errorDetail: ErrorDetail | undefined;
    let userList: User[] | undefined;

    try {
        const resData = await fetch(`${BASE_URL}/users`);
        const resUserList: UserResponse[] = await resData.json();
        userList = resUserList.map((user) => new User(user.id, user.email, user.token));
    } catch (_) {
        errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_UNKNOWN,
            ERROR_MESSAGES.ERROR_SERVER_UNKNOWN()
        );
        status = HttpStatusCode.InternalServerError;
    } finally {
        return NextResponse.json({ userList, errorDetail }, { status });
    }
}

/**
 * ユーザ登録API
 * ユーザ情報をDBに登録、認証トークンをcookieに設定
 * @param request リクエストパラメータ
 * @returns エラー情報
 */
export async function POST(request: Request) {
    let status: HttpStatusCode = HttpStatusCode.Ok;

    try {
        const token: string = uuidv7();
        const reqData = await request.json();
        await fetch(`${BASE_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...reqData, token }),
        });

        const apiResponse = NextResponse.json({ undefined }, { status });
        apiResponse.cookies.set("token", token, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
        });
        return apiResponse;
    } catch (_) {
        const errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_UNKNOWN,
            ERROR_MESSAGES.ERROR_SERVER_UNKNOWN()
        );
        status = HttpStatusCode.InternalServerError;
        return NextResponse.json({ errorDetail }, { status });
    }
}
