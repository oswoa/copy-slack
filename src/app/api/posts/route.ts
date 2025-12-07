import { Post, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/constants/api";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { HttpStatusCode } from "axios";

export type UserPost = Post & { displayName: string; imgUrl: string | null };

// APIレスポンス用
export type GetPostsApiResponse = {
    posts: UserPost[];
    errorDetail: ErrorDetail;
};

/**
 * ポスト一覧取得API
 * @returns ポスト一覧、エラー情報
 */
export async function GET(request: NextRequest) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    const posts: UserPost[] = [];
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
        });

        if (0 < res.length) {
            res.map((data) => {
                const userPost: UserPost = {
                    postId: data.postId,
                    channelId: data.channelId,
                    userId: data.userId,
                    displayName: data.user.displayName,
                    imgUrl: data.user.profile!.imageUrl,
                    content: data.content,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                };
                posts.push(userPost);
            });
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
    post?: UserPost;
    errorDetail: ErrorDetail;
};

/**
 * ポスト登録API
 * @returns ポスト、エラー情報
 */

export async function POST(request: Request) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let post: UserPost | undefined;
    let status: HttpStatusCode = HttpStatusCode.InternalServerError;

    try {
        // ポスト登録
        const { userId, channelId, content }: RegisterPostApiRequest = await request.json();
        const registerData: Prisma.PostCreateInput = {
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
        const registerRes = await prisma.post.create({ data: registerData });

        // 登録したポストをプロフィール画像付きで取得
        const findRes = await prisma.post.findUnique({
            where: {
                postId: registerRes.postId,
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
        });

        if (findRes) {
            status = HttpStatusCode.Created;
            post = {
                postId: findRes.postId,
                channelId: findRes.channelId,
                userId: findRes.userId,
                displayName: findRes.user.displayName,
                imgUrl: findRes.user.profile!.imageUrl,
                content: findRes.content,
                createdAt: findRes.createdAt,
                updatedAt: findRes.updatedAt,
            };
        }
    } catch (error) {
        errorDetail = ErrorDetail.getFromPrismaError(error);
    } finally {
        return NextResponse.json({ post, errorDetail }, { status });
    }
}
