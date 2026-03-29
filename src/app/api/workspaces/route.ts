import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { prisma } from "@/app/constants/api";
import { workspaceService } from "@/app/lib/init";
import { WorkspaceRecord } from "@/infrustructures/IWorkspaceDatabase";

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
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let status: HttpStatusCode = HttpStatusCode.Ok;
    const workspaces: WorkspaceRecord[] = [];

    try {
        const queryParams = request.nextUrl.searchParams;
        const ownerId = queryParams.get("ownerId") || undefined;

        // 所属する全てのワークスペースを取得（所有ワークスペース、招待されたワークスペース）
        const res = await prisma.workspaceUser.findMany({
            where: {
                userId: ownerId,
            },
            orderBy: {
                workspaceId: "asc",
            },
            include: {
                workspace: true,
            },
        });

        res.forEach((val) => workspaces.push(val.workspace));
    } catch (error) {
        status = HttpStatusCode.InternalServerError;
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ workspaces, errorDetail }, { status });
    }
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
