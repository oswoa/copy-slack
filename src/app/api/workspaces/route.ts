import { Prisma, Workspace } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { prisma } from "@/app/contants/api";

// TODO: ワークスペースの削除APIを実装

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
    let workspaces: Workspace[] = [];
    let status: HttpStatusCode = HttpStatusCode.Ok;

    const queryParams = request.nextUrl.searchParams;
    const ownerId = queryParams.get("ownerId") || undefined;

    try {
        const res = await prisma.workspace.findMany({
            where: {
                ownerId: {
                    contains: ownerId,
                },
            },
        });
        if (0 < res.length) {
            workspaces = res;
        }
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
