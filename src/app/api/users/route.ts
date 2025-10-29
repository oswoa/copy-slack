import { HttpStatusCode } from "axios";
import { NextResponse } from "next/server";
import { uuidv7 } from "uuidv7";

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
export type RegisterUserApiresponse = {
    user?: UserResponse;
    errorDetail?: ErrorDetailResponse;
};

/**
 * ユーザ情報一覧取得API
 * DBに登録されているユーザ情報一覧をDBから取得
 * @returns ユーザ情報一覧、エラー情報
 */
export async function GET() {
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let errorDetail: ErrorDetailResponse | undefined;
    let userList: UserResponse[] = [];

    try {
        const res = await fetch(`${BASE_URL}/users`);
        userList = await res.json();
    } catch (_) {
        errorDetail = {
            errCode: ERROR_CODES.ERROR_SERVER_UNKNOWN,
            errMsg: ERROR_MESSAGES.ERROR_SERVER_UNKNOWN(),
        };
        status = HttpStatusCode.InternalServerError;
        console.error(errorDetail);
    } finally {
        return NextResponse.json({ userList, errorDetail }, { status });
    }
}

type InputData = {
    id: string;
    email: string;
    password: string;
};

/**
 * ユーザ登録API
 * ユーザ情報をDBに登録、認証トークンをcookieに設定
 * @param request リクエストパラメータ
 * @returns ユーザ情報、エラー情報
 */
export async function POST(request: Request) {
    let status: HttpStatusCode = HttpStatusCode.Ok;
    let errorDetail: ErrorDetailResponse | undefined;
    let user: UserResponse | undefined;

    try {
        const token: string = uuidv7();
        const reqData: InputData = await request.json();

        // TODO: passwordをハッシュ化して保存する
        const res = await fetch(`${BASE_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...reqData, token }),
        });
        if (res.status !== HttpStatusCode.Ok) {
            errorDetail = {
                errCode: ERROR_CODES.ERROR_SERVER_UNKNOWN,
                errMsg: ERROR_MESSAGES.ERROR_SERVER_UNKNOWN(),
            };
            status = HttpStatusCode.InternalServerError;
            console.error(errorDetail);
            return NextResponse.json({ user, errorDetail }, { status });
        }

        // TODO: ワークスペースの作成処理を実装する
        user = {
            id: reqData.id,
            email: reqData.email,
            token,
        };
        const apiResponse = NextResponse.json({ user, errorDetail }, { status });
        apiResponse.cookies.set("userId", reqData.id, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
        });
        apiResponse.cookies.set("token", token, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
        });
        return apiResponse;
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
