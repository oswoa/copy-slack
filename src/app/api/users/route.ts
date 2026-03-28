import { NextRequest, NextResponse } from "next/server";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { UserRecord } from "@/infrustructures/IUserDatabase";
import { authService, userService } from "@/app/lib/init";

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
    const res = await userService.getUsersByDisplayName(displayName);

    return NextResponse.json(
        {
            users: res.users,
            errorDetail: res.errorDetail,
        },
        { status: res.errorDetail.status },
    );
}
