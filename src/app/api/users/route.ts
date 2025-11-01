import { HttpStatusCode } from "axios";
import { NextResponse } from "next/server";
import { uuidv7 } from "uuidv7";
import bcrypt from "bcrypt";

import { ErrorDetailResponse } from "@/app/common/ErrorDetail";
import { BASE_URL } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { SALT } from "@/app/contants/crypt";

// APIがDBから受け取る際の型
type UserResponse = {
    id: string;
    email: string;
    token: string;
};

// APIレスポンス用
export type GetUserListApiResponse = {
    user?: UserResponse;
    errorDetail?: ErrorDetailResponse;
};

/**
 * ユーザ一覧取得API
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

// APIリクエスト用
export type RegisterUserApiRequest = {
    id: string;
    email: string;
    password: string;
};

// APIレスポンス用
export type RegisterUserApiResponse = {
    user?: UserResponse;
    errorDetail?: ErrorDetailResponse;
};

/**
 * ユーザ登録API
 * ユーザ情報をDBに登録、認証トークンをcookieに設定
 * @param request リクエストパラメータ
 * @returns ユーザ情報、エラー情報
 */
export async function POST(request: Request) {
    let status: HttpStatusCode = HttpStatusCode.Created;
    let errorDetail: ErrorDetailResponse | undefined;
    let user: UserResponse | undefined;

    try {
        const req: RegisterUserApiRequest = await request.json();
        const token: string = uuidv7();
        const hash = await bcrypt.hash(req.password, SALT);

        // ユーザ登録
        const res = await fetch(`${BASE_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...req,
                token,
                password: hash,
            }),
        });

        switch (res.status) {
            case HttpStatusCode.Created:
                const resData: UserResponse = await res.json();
                user = {
                    id: resData.id,
                    email: resData.email,
                    token,
                };
                const apiResponse = NextResponse.json({ user, errorDetail }, { status });
                apiResponse.cookies.set("userId", req.id, {
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

            default:
                errorDetail = {
                    errCode: ERROR_CODES.ERROR_SERVER_FAILED_REGISTER_USER,
                    errMsg: ERROR_MESSAGES.ERROR_SERVER_FAILED_REGISTER_USER(),
                };
                status = HttpStatusCode.InternalServerError;
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
