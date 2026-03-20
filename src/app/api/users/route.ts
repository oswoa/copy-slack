import { NextRequest, NextResponse } from "next/server";
import { uuidv7 } from "uuidv7";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

import { ErrorDetail } from "@/app/common/ErrorDetail";

import { prisma } from "@/app/constants/api";
import { SALT } from "@/app/constants/crypt";
import { HttpStatusCode } from "axios";
import { UserRecord } from "@/infrustructures/IAuthDatabase";

// APIレスポンス用
export type GetUserListApiResponse = {
    // デフォルトで下記プロパティは返さないようprismaを設定している
    userList: UserRecord[];
    errorDetail: ErrorDetail;
};

/**
 * ユーザ一覧取得API
 * DBに登録されているユーザ情報一覧をDBから取得
 * @returns ユーザ情報一覧、エラー情報
 */
export async function GET(request: NextRequest) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let userList: UserRecord[] = [];
    let status: HttpStatusCode = HttpStatusCode.Ok;

    const queryParams = request.nextUrl.searchParams;
    const displayName = queryParams.get("displayName") || undefined;

    try {
        const res = await prisma.user.findMany({
            select: {
                userId: true,
                email: true,
                displayName: true,
            },
            where: {
                displayName: {
                    contains: displayName,
                },
            },
        });

        if (0 < res.length) {
            userList = res;
        }
    } catch (error) {
        status = HttpStatusCode.InternalServerError;
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ userList, errorDetail }, { status });
    }
}

// APIリクエスト用
export type RegisterUserApiRequest = {
    userId: string;
    email: string;
    password: string;
};

// APIレスポンス用
export type RegisterUserApiResponse = {
    // デフォルトで下記プロパティは返さないようprismaを設定している
    user?: UserRecord;
    errorDetail: ErrorDetail;
};

/**
 * ユーザ登録API
 * ユーザ情報をDBに登録、認証トークンをcookieに設定
 * @param request リクエストパラメータ
 * @returns ユーザ情報、エラー情報
 */
export async function POST(request: Request) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let user: UserRecord | undefined;
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

    try {
        const reqData: RegisterUserApiRequest = await request.json();
        const hash = await bcrypt.hash(reqData.password, SALT);

        const data: Prisma.UserCreateInput = {
            userId: reqData.userId,
            email: reqData.email,
            displayName: reqData.userId,
            password: hash,
            token: uuidv7(),
        };
        const res = await prisma.user.create({ data });
        if (res) {
            user = {
                userId: res.userId,
                email: res.email,
                displayName: res.displayName,
            };
            status = HttpStatusCode.Created;
        }

        const apiResponse = NextResponse.json({ user, errorDetail }, { status });
        apiResponse.cookies.set("userId", String(data.userId), {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
        });
        apiResponse.cookies.set("token", data.token, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
        });
        return apiResponse;
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
        return NextResponse.json({ user, errorDetail }, { status });
    }
}
