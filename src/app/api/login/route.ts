import { prisma } from "@/app/constants/api";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { HttpStatusCode } from "axios";
import { UserProfile } from "@/app/context/CurrentUserContext";

// APIリクエスト用
export type LoginApiRequest = {
    userId: string;
    password: string;
};

// APIレスポンス用
export type LoginApiResponse = {
    user?: UserProfile;
    errorDetail?: ErrorDetail;
};

/**
 * ログインAPI
 * @param request ユーザID, パスワード
 * @returns ユーザ情報、エラー情報
 */
export async function POST(request: NextRequest) {
    let user: UserProfile | undefined;
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

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
                ERROR_CODES.ERROR_CLIENT_VALIDATION_INCORRECT_PASSWORD,
                ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_INCORRECT_PASSWORD
            );
            return NextResponse.json({ user, errorDetail }, { status });
        }

        const isValid = await bcrypt.compare(password, res.password);
        if (!isValid) {
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_CLIENT_VALIDATION_INCORRECT_PASSWORD,
                ERROR_MESSAGES.ERROR_CLIENT_VALIDATION_INCORRECT_PASSWORD
            );
            return NextResponse.json({ user, errorDetail }, { status });
        }

        user = {
            userId: res.userId,
            email: res.email,
            displayName: res.displayName,
        };
        status = HttpStatusCode.Ok;

        const apiResponse = NextResponse.json({ user, errorDetail }, { status });
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
        return NextResponse.json({ user, errorDetail }, { status });
    }
}
