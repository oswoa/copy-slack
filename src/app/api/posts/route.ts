import { NextRequest, NextResponse } from "next/server";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { postService } from "@/app/lib/init";
import { PostRecord } from "@/infrustructures/IPostDatabase";
import { HttpStatusCode } from "axios";
import { Prisma } from "@prisma/client";
import { prisma } from "@/app/constants/api";

// APIレスポンス用
export type GetPostsApiResponse = {
    posts: PostRecord[];
    errorDetail: ErrorDetail;
};

/**
 * ポスト一覧取得API
 * @returns ポスト一覧、エラー情報
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || undefined;
    const channelId = searchParams.get("channelId") || undefined;
    let status: HttpStatusCode = HttpStatusCode.Ok;

    const serviceResponse = await postService.getPosts(userId!, channelId!);
    if (!serviceResponse.errorDetail.success) {
        status = serviceResponse.errorDetail.status;
    }

    const apiResponse: GetPostsApiResponse = {
        posts: serviceResponse.posts,
        errorDetail: serviceResponse.errorDetail,
    };
    return NextResponse.json(apiResponse, { status });
}

// APIリクエスト用
export type RegisterPostApiRequest = {
    userId: string;
    channelId: string;
    content: string;
};

// APIレスポンス用
export type RegisterPostApiResponse = {
    post?: PostRecord;
    errorDetail: ErrorDetail;
};

/**
 * ポスト登録API
 * @returns ポスト、エラー情報
 */

export async function POST(request: Request) {
    let errorDetail: ErrorDetail = ErrorDetail.success();
    let post: PostRecord | undefined;
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
                imgUrl: findRes.user.profile!.imageUrl || "",
                content: findRes.content || "",
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
