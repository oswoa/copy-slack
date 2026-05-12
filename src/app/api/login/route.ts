import { NextRequest, NextResponse } from "next/server";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { authService } from "@/app/lib/init";
import { UserRecord } from "@/infrastructures/user/IUserDatabase";

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

    const serviceResponse = await authService.login(userId, password);
    if (!serviceResponse.errorDetail.success) {
        const errorDetail = serviceResponse.errorDetail;
        return NextResponse.json<LoginApiResponse>({ errorDetail }, { status: errorDetail.status });
    }

    const apiResponse = NextResponse.json<LoginApiResponse>({
        user: {
            userId: serviceResponse.user!.userId,
            email: serviceResponse.user!.email,
            displayName: serviceResponse.user!.displayName,
            imageUrl: serviceResponse.user?.imageUrl || "",
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
