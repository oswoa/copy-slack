import { NextResponse } from "next/server";
import { User } from "@prisma/client";
import { HttpStatusCode } from "axios";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { prisma } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

// APIレスポンス用
export type GetUserApiResponse = {
    user: Omit<User, "password" | "token"> | undefined;
    errorDetail: ErrorDetail;
};

/**
 * ユーザ取得API
 * @param param1 ユーザID
 * @returns ユーザ、エラー情報
 */
export async function GET(_: Request, { params }: { params: Promise<{ userId: string }> }) {
    let errorDetail: ErrorDetail = new ErrorDetail(
        ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
        ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED
    );
    let user: Omit<User, "password" | "token"> | undefined;
    let returnCode = {
        status: HttpStatusCode.Unauthorized,
    };

    try {
        const { userId } = await params;
        const res = await prisma.user.findUnique({
            where: {
                userId,
            },
        });
        if (res) {
            user = res;
            returnCode = {
                status: HttpStatusCode.Ok,
            };
            errorDetail = ErrorDetail.success();
        }
    } catch (error) {
        returnCode = {
            status: HttpStatusCode.InternalServerError,
        };
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ user, errorDetail }, returnCode);
    }
}
