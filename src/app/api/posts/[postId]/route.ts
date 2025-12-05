import { Post } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/app/constants/api";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { HttpStatusCode } from "axios";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";

// APIレスポンス用
export type DeletePostApiResponse = {
    post?: Post;
    errorDetail: ErrorDetail;
};

/**
 * ポスト削除API
 * @returns 削除されたポスト、エラー情報
 */

export async function DELETE(_: Request, { params }: { params: Promise<{ postId: string }> }) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let post: Post | undefined;
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

    try {
        const { postId } = await params;
        const parsedPostId = Number(postId);

        const findRes = await prisma.post.findUnique({
            where: {
                postId: parsedPostId,
            },
        });
        if (!findRes) {
            status = HttpStatusCode.NotFound;
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_NOT_FOUND_RECORDS,
                ERROR_MESSAGES.ERROR_SERVER_NOT_FOUND_RECORDS
            );
            return NextResponse.json({ post, errorDetail }, { status });
        }

        post = await prisma.post.delete({
            where: {
                postId: parsedPostId,
            },
        });
        status = HttpStatusCode.Ok;
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ post, errorDetail }, { status });
    }
}
