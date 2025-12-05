import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

import { ErrorDetail } from "@/app/common/ErrorDetail";

import { prisma } from "@/app/constants/api";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { UserProfile } from "@/app/context/CurrentUserContext";

// APIレスポンス用
export type AuthApiResponse = {
    user?: UserProfile;
    errorDetail: ErrorDetail;
};

/**
 * ユーザ認証API
 * @param request cookie
 * @returns エラー情報
 */
export async function GET(request: NextRequest) {
    let user: UserProfile | undefined;
    let errorDetail: ErrorDetail = new ErrorDetail(
        ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
        ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED
    );
    let status: HttpStatusCode = HttpStatusCode.Unauthorized;

    try {
        const hasToken = request.cookies.has("token");
        const hasUserId = request.cookies.has("userId");
        if (!hasToken || !hasUserId) {
            return NextResponse.json({ user, errorDetail }, { status });
        }

        const token = request.cookies.get("token");
        const userId = request.cookies.get("userId");
        if (token!.value.length === 0 || userId!.value.length === 0) {
            return NextResponse.json({ user, errorDetail }, { status });
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
            return NextResponse.json({ user, errorDetail }, { status });
        }

        if (res.token !== token!.value) {
            return NextResponse.json({ user, errorDetail }, { status });
        }

        errorDetail = ErrorDetail.success();
        status = HttpStatusCode.Ok;
        user = {
            userId: res.userId,
            email: res.email,
            displayName: res.displayName,
        };
        return NextResponse.json({ user, errorDetail }, { status });
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
        return NextResponse.json({ user, errorDetail }, { status });
    }
}
