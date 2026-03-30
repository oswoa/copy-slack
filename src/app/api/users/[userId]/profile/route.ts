import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";

import { profileService } from "@/app/lib/init";
import { ProfileRecord } from "@/infrustructures/IProfileDatabase";

// APIレスポンス用
export type UpdateProfileApiResponse = {
    profile?: ProfileRecord;
    errorDetail: ErrorDetail;
};

/**
 * プロフィール更新API
 * @returns プロフィール画像のURL、エラー情報
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
) {
    const { userId } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const uploadPath = formData.get("uploadPath") as string;

    if (!file) {
        const errorDetail = new ErrorDetail(
            ERROR_CODES.ERROR_SERVER_VALIDATION,
            ERROR_MESSAGES.ERROR_SERVER_VALIDATION,
            HttpStatusCode.BadRequest,
        );
        return NextResponse.json({ errorDetail }, { status: errorDetail.status });
    }

    const serviceResponse = await profileService.updateProfile(userId, uploadPath, file);
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<UpdateProfileApiResponse>(
            { errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<UpdateProfileApiResponse>(
        {
            profile: serviceResponse.profile,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
}
