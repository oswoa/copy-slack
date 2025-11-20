import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { HttpStatusCode } from "axios";

import { prisma } from "@/app/contants/api";

import { ErrorDetail } from "@/app/common/ErrorDetail";

// APIレスポンス用
export type RegisterWorkspaceUserApiResponse = {
    userId: string | undefined;
    workspaceId: string | undefined;
    errorDetail: ErrorDetail;
};

/**
 * ワークスペースユーザ登録API
 * @returns ワークスペース、ユーザ、エラー情報
 */
export async function POST(
    _: Request,
    { params }: { params: Promise<{ workspaceId: string; userId: string }> }
) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

    try {
        const { workspaceId, userId } = await params;
        const data: Prisma.WorkspaceUserCreateInput = {
            user: {
                connect: {
                    userId,
                },
            },
            workspace: {
                connect: {
                    workspaceId,
                },
            },
        };
        await prisma.workspaceUser.create({ data });
        status = HttpStatusCode.Created;
        return NextResponse.json({ workspaceId, userId, errorDetail }, { status });
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
        return NextResponse.json({ errorDetail }, { status });
    }
}
