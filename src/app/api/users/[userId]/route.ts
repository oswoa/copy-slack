import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { UserRecord } from "@/infrastructures/user/IUserDatabase";
import { userService } from "@/app/lib/init";

// APIレスポンス用
export type UpdateUserApiRequest = {
    displayName: string;
    email: string;
};

// APIレスポンス用
export type UpdateUserApiResponse = {
    user?: UserRecord;
    errorDetail: ErrorDetail;
};

/**
 * ユーザ更新API
 * @param param1 ユーザID
 * @returns ユーザ、エラー情報
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
) {
    const { userId } = await params;
    const { email, displayName }: UpdateUserApiRequest = await request.json();

    // ログインユーザ以外の情報を書き換えさせない
    const cookieUserId = request.cookies.get("userId");
    if (userId !== cookieUserId?.value) {
        const errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_USER_UNAUTHORIZED,
            ERROR_MESSAGES.ERROR_SERVER_USER_UNAUTHORIZED,
            HttpStatusCode.Unauthorized,
        );
        return NextResponse.json<UpdateUserApiResponse>(
            { errorDetail },
            { status: errorDetail.status },
        );
    }

    const serviceResponse = await userService.updateUser(userId, email, displayName);
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<UpdateUserApiResponse>(
            { errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<UpdateUserApiResponse>(
        {
            user: serviceResponse.user,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
}
