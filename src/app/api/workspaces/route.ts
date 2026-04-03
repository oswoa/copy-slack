import { NextRequest, NextResponse } from "next/server";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { workspaceService } from "@/app/lib/init";
import { WorkspaceRecord } from "@/infrastructures/IWorkspaceDatabase";

// APIレスポンス用
export type GetWorkspaceListApiResponse = {
    workspaces: WorkspaceRecord[];
    errorDetail: ErrorDetail;
};

/**
 * ワークスペース一覧取得API
 * @returns ワークスペース一覧、エラー情報
 */
export async function GET(request: NextRequest) {
    const queryParams = request.nextUrl.searchParams;
    const ownerId = queryParams.get("ownerId") || undefined;

    const serviceResponse = await workspaceService.getWorkspaces(ownerId!);
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<GetWorkspaceListApiResponse>(
            {
                workspaces: [],
                errorDetail: serviceResponse.errorDetail,
            },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<GetWorkspaceListApiResponse>(
        {
            workspaces: serviceResponse.workspaces!,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
}

// APIリクエスト用
export type RegisterWorkspaceApiRequest = {
    userId: string;
    workspaceName?: string;
};

// APIレスポンス用
export type RegisterWorkspaceApiResponse = {
    workspace?: WorkspaceRecord;
    errorDetail: ErrorDetail;
};

/**
 * ワークスペース登録API
 * @returns ワークスペース、エラー情報
 */
export async function POST(request: Request) {
    const { userId, workspaceName }: RegisterWorkspaceApiRequest = await request.json();

    const serviceResponse = await workspaceService.createWorkspace(userId, workspaceName!);
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<RegisterWorkspaceApiResponse>(
            { errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<RegisterWorkspaceApiResponse>(
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
