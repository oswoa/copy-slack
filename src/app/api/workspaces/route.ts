import { Prisma, Workspace } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { prisma } from "@/app/contants/api";

// APIレスポンス用
export type GetWorkspaceListApiResponse = {
    workspaces: Workspace[];
    errorDetail: ErrorDetail;
};

/**
 * ワークスペース一覧取得API
 * @returns ワークスペース一覧、エラー情報
 */
export async function GET(request: NextRequest) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let status: HttpStatusCode = HttpStatusCode.Ok;
    const workspaces: Workspace[] = [];

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
    workspace: Workspace | undefined;
    errorDetail: ErrorDetail;
};

/**
 * ワークスペース登録API
 * @returns ワークスペース、エラー情報
 */
export async function POST(request: Request) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let workspace: Workspace | undefined;
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

    try {
        const reqData: RegisterWorkspaceApiRequest = await request.json();
        const data: Prisma.WorkspaceCreateInput = {
            workspaceName: reqData.workspaceName || reqData.userId,
            owner: {
                connect: {
                    userId: reqData.userId,
                },
            },
        };
        workspace = await prisma.workspace.create({ data });

        if (workspace) {
            status = HttpStatusCode.Created;
        }
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ workspace, errorDetail }, { status });
    }
}
