import { NextRequest, NextResponse } from "next/server";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserRecord } from "@/infrustructures/IUserDatabase";
import { authService, userService } from "@/app/lib/init";
import { RegisterWorkspaceApiResponse } from "../workspaces/route";

// APIレスポンス用
export type GetUserListApiResponse = {
    // デフォルトで下記プロパティは返さないようprismaを設定している
    users: UserRecord[];
    errorDetail: ErrorDetail;
};

/**
 * ユーザ一覧取得API
 * DBに登録されているユーザ情報一覧をDBから取得
 * @returns ユーザ情報一覧、エラー情報
 */
export async function GET(request: NextRequest) {
    const queryParams = request.nextUrl.searchParams;
    const displayName = queryParams.get("displayName") || "";

    const serviceResponse = await userService.getUsersByDisplayName(displayName);
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<GetUserListApiResponse>(
            {
                users: [],
                errorDetail: serviceResponse.errorDetail,
            },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<GetUserListApiResponse>(
        {
            users: serviceResponse.users,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
}
