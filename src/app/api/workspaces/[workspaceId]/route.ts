import { ErrorDetail } from "@/app/common/ErrorDetail";
import { workspaceService } from "@/app/lib/init";
import { NextResponse } from "next/server";
import { WorkspaceRecord } from "@/infrastructures/workspace/IWorkspaceDatabase";

// APIレスポンス用
export type DeleteWorkspaceApiResponse = {
    workspace?: WorkspaceRecord;
    errorDetail: ErrorDetail;
};

/**
 * ワークスペース削除API
 * @returns 削除されたワークスペース、エラー情報
 */
export async function DELETE(_: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
    const { workspaceId } = await params;

    const serviceResponse = await workspaceService.deleteWorkspace(workspaceId);
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<DeleteWorkspaceApiResponse>(
            { errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<DeleteWorkspaceApiResponse>(
        {
            workspace: {
                workspaceId: serviceResponse.workspace!.workspaceId,
                ownerId: serviceResponse.workspace!.ownerId,
                workspaceName: serviceResponse.workspace!.workspaceName,
            },
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
}
