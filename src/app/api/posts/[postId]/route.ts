import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/app/constants/api";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { HttpStatusCode } from "axios";
import { PostRecord } from "@/infrustructures/IPostDatabase";
import { postService } from "@/app/lib/init";

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
    post?: PostRecord;
    errorDetail: ErrorDetail;
};

/**
 * ポスト削除API
 * @returns 削除されたポスト、エラー情報
 */

export async function DELETE(_: Request, { params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params;

    const serviceResponse = await postService.deletePost(postId);
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<DeletePostApiResponse>(
            { errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<DeletePostApiResponse>(
        {
            post: serviceResponse.post,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
}
