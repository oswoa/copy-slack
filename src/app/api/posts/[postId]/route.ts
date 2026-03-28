import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/app/constants/api";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { HttpStatusCode } from "axios";
import { ERROR_CODES } from "@/app/constants/errorCodes";
import { ERROR_MESSAGES } from "@/app/constants/errorMessages";
import { PostRecord } from "@/infrustructures/IPostDatabase";

// APIリクエスト用
export type UpdatePostApiRequest = {
    content: string;
};

// APIレスポンス用
export type UpdatePostApiResponse = {
    post?: PostRecord;
    errorDetail: ErrorDetail;
};

/**
 * ポスト更新API
 * @returns ポスト、エラー情報
 */

export async function PATCH(request: Request, { params }: { params: Promise<{ postId: string }> }) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let post: PostRecord | undefined;
    let status: HttpStatusCode = HttpStatusCode.Ok;

    try {
        const { postId } = await params;
        const { content }: UpdatePostApiRequest = await request.json();

        const data: Prisma.PostUpdateInput = {
            content,
        };
        const res = await prisma.post.update({
            where: {
                postId,
            },
            select: {
                postId: true,
                channelId: true,
                userId: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        displayName: true,
                        profile: {
                            select: {
                                imageUrl: true,
                            },
                        },
                    },
                },
            },
            data,
        });
        if (res) {
            post = {
                postId: res.postId,
                channelId: res.channelId,
                userId: res.userId,
                content: res.content || "",
                createdAt: res.createdAt,
                updatedAt: res.updatedAt,
                displayName: res.user.displayName,
                imgUrl: res.user.profile?.imageUrl || "",
            };
        }
    } catch (error) {
        status = HttpStatusCode.InternalServerError;
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ post, errorDetail }, { status });
    }
}

// APIレスポンス用
export type DeletePostApiResponse = {
    errorDetail: ErrorDetail;
};

/**
 * ポスト削除API
 * @returns 削除されたポスト、エラー情報
 */

export async function DELETE(_: Request, { params }: { params: Promise<{ postId: string }> }) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let post: PostRecord | undefined;
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

    try {
        const { postId } = await params;
        const findRes = await prisma.post.findUnique({
            where: {
                postId,
            },
        });
        if (!findRes) {
            status = HttpStatusCode.NotFound;
            errorDetail = new ErrorDetail(
                ERROR_CODES.ERROR_SERVER_NOT_FOUND_RECORDS,
                ERROR_MESSAGES.ERROR_SERVER_NOT_FOUND_RECORDS,
                HttpStatusCode.NotFound,
            );
            return NextResponse.json({ errorDetail }, { status });
        }

        await prisma.post.delete({
            where: {
                postId,
            },
        });
        status = HttpStatusCode.Ok;
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ errorDetail }, { status });
    }
}
