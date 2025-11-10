import { Post, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/contants/api";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { HttpStatusCode } from "axios";

// APIレスポンス用
export type GetPostsApiResponse = {
    posts: Post[];
    errorDetail: ErrorDetail;
};

/**
 * ポスト一覧取得API
 * @returns ポスト一覧、エラー情報
 */
export async function GET(request: NextRequest) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let posts: Post[] = [];
    let status: HttpStatusCode = HttpStatusCode.Ok;

    const searchParams = request.nextUrl.searchParams;
    const channelId = searchParams.get("channelId") || undefined;
    const userId = searchParams.get("userId") || undefined;

    try {
        const res = await prisma.post.findMany({
            where: {
                channelId: channelId ? Number(channelId) : undefined,
                userId,
            },
        });

        if (0 < res.length) {
            posts = res;
        }
    } catch (error) {
        status = HttpStatusCode.InternalServerError;
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ posts, errorDetail }, { status });
    }
}

// APIリクエスト用
export type RegisterPostApiRequest = {
    userId: string;
    channelId: string;
    content: string;
};

// APIレスポンス用
export type RegisterPostApiResponse = {
    post: Post | undefined;
    errorDetail: ErrorDetail;
};

/**
 * ポスト登録API
 * @returns ポスト、エラー情報
 */

export async function POST(request: Request) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let post: Post | undefined;
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

    try {
        const { userId, channelId, content }: RegisterPostApiRequest = await request.json();
        const data: Prisma.PostCreateInput = {
            channel: {
                connect: {
                    channelId: Number(channelId),
                },
            },
            user: {
                connect: {
                    userId,
                },
            },
            content,
        };
        const res = await prisma.post.create({ data });

        if (res) {
            status = HttpStatusCode.Created;
            post = res;
        }
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ post, errorDetail }, { status });
    }
}
