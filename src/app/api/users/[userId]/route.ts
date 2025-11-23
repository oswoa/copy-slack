import { NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { prisma } from "@/app/contants/api";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";
import { SafeUser } from "@/app/context/CurrentUserContext";

// APIレスポンス用
export type GetUserApiResponse = {
    user?: SafeUser;
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
    let user: SafeUser | undefined;
    let status: HttpStatusCode = HttpStatusCode.Unauthorized;

    try {
        const { userId } = await params;
        const res = await prisma.user.findUnique({
            where: {
                userId,
            },
        });
        if (res) {
            user = {
                userId: res.userId,
                displayName: res.displayName,
            };
            status = HttpStatusCode.Ok;
            errorDetail = ErrorDetail.success();
        }
    } catch (error) {
        status = HttpStatusCode.InternalServerError;
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ user, errorDetail }, { status });
    }
}
