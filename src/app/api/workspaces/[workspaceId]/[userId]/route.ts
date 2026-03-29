import { NextResponse } from "next/server";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { workspaceService } from "@/app/lib/init";

// APIレスポンス用
export type InviteUserApiResponse = {
    workspaceId?: string | undefined;
    userId?: string | undefined;
    errorDetail: ErrorDetail;
};

/**
 * ユーザ招待API
 * @returns ワークスペース、ユーザ、エラー情報
 */
export async function POST(
    _: Request,
    { params }: { params: Promise<{ workspaceId: string; userId: string }> },
) {
    const { workspaceId, userId } = await params;

    const serviceResponse = await workspaceService.inviteUserToWorkspace(workspaceId, userId);
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<InviteUserApiResponse>(
            { errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<InviteUserApiResponse>(
        {
            workspaceId: serviceResponse.workspaceId,
            userId: serviceResponse.userId,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
}
