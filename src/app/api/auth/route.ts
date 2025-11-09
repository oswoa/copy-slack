import { NextRequest, NextResponse } from "next/server";
import { User } from "@prisma/client";
import { HttpStatusCode } from "axios";

import { ErrorDetail } from "@/app/common/ErrorDetail";

import { prisma } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

// APIレスポンス用
export type AuthApiResponse = {
    user: Omit<User, "password"> | undefined;
    errorDetail: ErrorDetail;
};

/**
 * ユーザ認証API
 * @param request cookie
 * @returns エラー情報
 */
export async function GET(request: NextRequest) {
    let user: Omit<User, "password" | "token"> | undefined;
    let errorDetail: ErrorDetail = new ErrorDetail(
        ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
        ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED
    );
    let returnCode = {
        status: HttpStatusCode.Unauthorized,
    };

    try {
        const hasToken = request.cookies.has("token");
        const hasUserId = request.cookies.has("userId");
        if (!hasToken || !hasUserId) {
            return NextResponse.json({ user, errorDetail }, returnCode);
        }

        const token = request.cookies.get("token");
        const userId = request.cookies.get("userId");
        if (token!.value.length === 0 || userId!.value.length === 0) {
            return NextResponse.json({ user, errorDetail }, returnCode);
        }

        const res = await prisma.user.findUnique({
            // prismaはデフォルトでtokenを返さないよう設定している
            omit: {
                token: false,
            },
            where: {
                userId: userId?.value,
            },
        });
        if (!res) {
            return NextResponse.json({ user, errorDetail }, returnCode);
        }

        if (res.token !== token!.value) {
            return NextResponse.json({ user, errorDetail }, returnCode);
        }

        errorDetail = ErrorDetail.success();
        returnCode = {
            status: HttpStatusCode.Ok,
        };
        user = res;
        return NextResponse.json({ user, errorDetail }, returnCode);
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
        return NextResponse.json({ user, errorDetail }, returnCode);
    }
}
