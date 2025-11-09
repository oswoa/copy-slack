import { NextResponse } from "next/server";
import { Workspace } from "@prisma/client";
import { HttpStatusCode } from "axios";

import { prisma } from "@/app/contants/api";

import { ErrorDetail } from "@/app/common/ErrorDetail";

// APIレスポンス用
export type GetWorkspaceApiResponse = {
    workspace: Workspace | undefined;
    errorDetail: ErrorDetail;
};

/**
 * ワークスペース取得API
 * @returns ワークスペース一覧、エラー情報
 */
export async function GET(_: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let workspace: Workspace | undefined;
    let returnCode = {
        status: HttpStatusCode.NotFound,
    };

    try {
        const { workspaceId } = await params;
        const res = await prisma.workspace.findUnique({
            where: {
                workspaceId,
            },
        });
        if (res) {
            returnCode = {
                status: HttpStatusCode.Ok,
            };
            workspace = res;
        }
    } catch (error) {
        returnCode = {
            status: HttpStatusCode.InternalServerError,
        };
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ workspace, errorDetail }, returnCode);
    }
}
