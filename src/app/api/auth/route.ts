import { NextRequest, NextResponse } from "next/server";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { authService } from "@/app/lib/init";
import { UserRecord } from "@/infrustructures/IUserDatabase";

// APIレスポンス用
export type AuthApiResponse = {
    user?: UserRecord;
    errorDetail: ErrorDetail;
};

/**
 * ユーザ認証API
 * @param request cookie
 * @returns エラー情報
 */
export async function GET(request: NextRequest) {
    const serviceResponse = await authService.auth(request.cookies);

    if (!serviceResponse.errorDetail.success) {
        const errorDetail = serviceResponse.errorDetail;
        const apiResponse: AuthApiResponse = {
            errorDetail,
        };
        return NextResponse.json(apiResponse, { status: errorDetail.status });
    }

    const apiResponse: AuthApiResponse = {
        user: serviceResponse.user,
        errorDetail: serviceResponse.errorDetail,
    };
    return NextResponse.json(apiResponse);
}
