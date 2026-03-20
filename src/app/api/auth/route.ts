import { NextRequest, NextResponse } from "next/server";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { service } from "@/app/lib/init";
import { UserDatabase } from "@/infrustructures/IAuthDatabase";
import { HttpStatusCode } from "axios";

// APIレスポンス用
export type AuthApiResponse = {
    user?: UserDatabase;
    errorDetail: ErrorDetail;
};

/**
 * ユーザ認証API
 * @param request cookie
 * @returns エラー情報
 */
export async function GET(request: NextRequest) {
    const serviceResponse = await service.auth(request.cookies);

    if (!serviceResponse.errorDetail.success) {
        const apiResponse: AuthApiResponse = {
            errorDetail: serviceResponse.errorDetail,
        };
        return NextResponse.json(apiResponse, { status: HttpStatusCode.Unauthorized });
    }

    const apiResponse: AuthApiResponse = {
        user: serviceResponse.user,
        errorDetail: serviceResponse.errorDetail,
    };
    return NextResponse.json(apiResponse);
}
