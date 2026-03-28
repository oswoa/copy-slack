import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/app/lib/init";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserRecord, UserRecordWithSecrets } from "@/infrustructures/IUserDatabase";
import { SignupServiceResponse } from "@/services/IAuthService";
import { ProfileRecord } from "@/infrustructures/IProfileDatabase";

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

    const res: SignupServiceResponse = await authService.signup(userId, email, password);
    if (!res.errorDetail.success) {
        return NextResponse.json<RegisterUserApiResponse>(
            { errorDetail: res.errorDetail },
            { status: res.errorDetail.status },
        );
    }

    const apiResponse = NextResponse.json<RegisterUserApiResponse>(
        {
            user: {
                userId: res.user!.userId,
                email: res.user!.email,
                displayName: res.user!.displayName,
                imageUrl: res.user?.imageUrl || "",
            },
            workspaceId: res.workspaceId,
            channelId: res.channelId,
            errorDetail: res.errorDetail,
        },
        { status: res.errorDetail.status },
    );

    apiResponse.cookies.set("userId", res.user!.userId, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
    });
    apiResponse.cookies.set("token", res.user!.token, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
    });
    return apiResponse;
}
