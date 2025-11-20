import { NextResponse } from "next/server";
import { Workspace } from "@prisma/client";
import { HttpStatusCode } from "axios";

import { prisma } from "@/app/contants/api";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { ERROR_CODES } from "@/app/contants/errorCodes";
import { ERROR_MESSAGES } from "@/app/contants/errorMessages";

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
    let status: HttpStatusCode = HttpStatusCode.NotFound;

    try {
        const { workspaceId } = await params;
        const res = await prisma.workspace.findUnique({
            where: {
                workspaceId,
            },
        });
        if (res) {
            status = HttpStatusCode.Ok;
            workspace = res;
        }
    } catch (error) {
        status = HttpStatusCode.InternalServerError;
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ workspace, errorDetail }, { status });
    }
}

// APIレスポンス用
export type DeleteWorkspaceApiResponse = {
    workspace: Workspace | undefined;
    errorDetail: ErrorDetail;
};

/**
 * ワークスペース削除API
 * @returns 削除されたワークスペース、エラー情報
 */
export async function DELETE(_: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let workspace: Workspace | undefined;
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

    const { workspaceId } = await params;

    try {
        const findRes = await prisma.workspace.findUnique({
            where: {
                workspaceId,
            },
        });
        if (!findRes) {
            status = HttpStatusCode.NotFound;
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_NOT_FOUND_RECORDS,
                ERROR_MESSAGES.ERROR_SERVER_NOT_FOUND_RECORDS
            );
            return NextResponse.json({ workspace, errorDetail }, { status });
        }

        workspace = await prisma.workspace.delete({
            where: {
                workspaceId,
            },
        });
        status = HttpStatusCode.Ok;
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ workspace, errorDetail }, { status });
    }
}
