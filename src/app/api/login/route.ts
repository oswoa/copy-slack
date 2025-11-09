import { prisma } from "@/app/contants/api";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { HttpStatusCode } from "axios";

// APIレスポンス用
export type LoginApiRequest = {
    userId: string;
    password: string;
};

// APIレスポンス用
export type LoginApiResponse = {
    user: Omit<User, "password" | "token"> | undefined;
    errorDetail?: ErrorDetail;
};

/**
 * ログインAPI
 * @param request ユーザID, パスワード
 * @returns ユーザ情報、エラー情報
 */
export async function POST(request: NextRequest) {
    let user: Omit<User, "password" | "token"> | undefined;
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let returnCode = {
        status: HttpStatusCode.InternalServerError,
    };

    try {
        const { userId, password }: LoginApiRequest = await request.json();
        const res = await prisma.user.findUnique({
            // prismaにデフォルトで返さないよう設定している
            omit: {
                password: false,
                token: false,
            },
            where: {
                userId,
            },
        });

        if (!res) {
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
                ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED
            );
            return NextResponse.json({ user, errorDetail }, returnCode);
        }

        const isValid = await bcrypt.compare(password, res.password);
        if (!isValid) {
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
                ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED
            );
            return NextResponse.json({ user, errorDetail }, returnCode);
        }

        user = res;
        returnCode = {
            status: HttpStatusCode.Ok,
        };

        const apiResponse = NextResponse.json({ user, errorDetail }, returnCode);
        apiResponse.cookies.set("userId", String(res.userId), {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
        });
        apiResponse.cookies.set("token", res.token, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
        });
        return apiResponse;
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
        return NextResponse.json({ user, errorDetail }, returnCode);
    }
}
