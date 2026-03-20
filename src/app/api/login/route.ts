import { NextRequest, NextResponse } from "next/server";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { service } from "@/app/lib/init";
import { LoginServiceRequest } from "@/services/IAuthService";
import { UserDatabase } from "@/infrustructures/IAuthDatabase";
import { HttpStatusCode } from "axios";

// APIリクエスト用
export type LoginApiRequest = {
    userId: string;
    password: string;
};

// APIレスポンス用
export type LoginApiResponse = {
    user?: UserDatabase;
    errorDetail?: ErrorDetail;
};

/**
 * ログインAPI
 * @param request ユーザID, パスワード
 * @returns ユーザ情報、エラー情報
 */
export async function POST(request: NextRequest) {
    const { userId, password }: LoginApiRequest = await request.json();
    const serviceRequest: LoginServiceRequest = {
        userId,
        password,
    };

    const serviceResponse = await service.login(serviceRequest);
    if (!serviceResponse.errorDetail?.success) {
        return NextResponse.json(
            { errorDetail: serviceResponse.errorDetail },
            { status: HttpStatusCode.Unauthorized },
        );
    }

    const user: UserDatabase = {
        userId: serviceResponse.user!.userId,
        email: serviceResponse.user!.email,
        displayName: serviceResponse.user!.displayName,
    };

    const apiResponse = NextResponse.json({
        user,
        errorDetail: serviceResponse.errorDetail,
    });
    apiResponse.cookies.set("userId", serviceResponse.user!.userId, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
    });
    apiResponse.cookies.set("token", serviceResponse.user!.token, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
    });
    return apiResponse;
}
