import { NextRequest, NextResponse } from "next/server";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { authService } from "@/app/lib/init";
import { LoginServiceRequest } from "@/services/IAuthService";
import { UserRecord } from "@/infrustructures/IAuthDatabase";

// APIリクエスト用
export type LoginApiRequest = {
    userId: string;
    password: string;
};

// APIレスポンス用
export type LoginApiResponse = {
    user?: UserRecord;
    workspaceId?: string;
    channelId?: string;
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

    const serviceResponse = await authService.login(serviceRequest);
    if (!serviceResponse.errorDetail.success) {
        const errorDetail = serviceResponse.errorDetail;
        return NextResponse.json({ errorDetail }, { status: errorDetail.status });
    }

    const apiResponse = NextResponse.json({
        user: {
            userId: serviceResponse.user!.userId,
            email: serviceResponse.user!.email,
            displayName: serviceResponse.user!.displayName,
        },
        workspaceId: serviceResponse.workspaceId,
        channelId: serviceResponse.channelId,
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
