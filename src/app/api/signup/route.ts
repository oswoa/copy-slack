import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/app/lib/init";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserRecord } from "@/infrustructures/IUserDatabase";
import { SignupServiceResponse } from "@/services/IAuthService";

// APIリクエスト用
export type RegisterUserApiRequest = {
    userId: string;
    email: string;
    password: string;
};

// APIレスポンス用
export type RegisterUserApiResponse = {
    user?: UserRecord;
    workspaceId?: string;
    channelId?: string;
    errorDetail: ErrorDetail;
};

/**
 * ユーザ登録API
 * ユーザ情報をDBに登録、認証トークンをcookieに設定
 * @param request リクエストパラメータ
 * @returns ユーザ情報、エラー情報
 */
export async function POST(request: NextRequest) {
    const { userId, email, password }: RegisterUserApiRequest = await request.json();

    const serviceResponse: SignupServiceResponse = await authService.signup(
        userId,
        email,
        password,
    );
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<RegisterUserApiResponse>(
            { errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    const apiResponse = NextResponse.json<RegisterUserApiResponse>(
        {
            user: {
                userId: serviceResponse.user!.userId,
                email: serviceResponse.user!.email,
                displayName: serviceResponse.user!.displayName,
                imageUrl: serviceResponse.user?.imageUrl || "",
            },
            workspaceId: serviceResponse.workspaceId,
            channelId: serviceResponse.channelId,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );

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
