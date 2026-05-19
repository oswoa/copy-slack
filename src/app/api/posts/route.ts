import { NextRequest, NextResponse } from "next/server";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { postService } from "@/app/lib/init";
import { PostRecord } from "@/infrastructures/post/IPostDatabase";

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

    const serviceResponse = await postService.getPosts(userId!, channelId!);
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<GetPostsApiResponse>(
            { posts: [], errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<GetPostsApiResponse>(
        {
            posts: serviceResponse.posts,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
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
    const { userId, channelId, content }: RegisterPostApiRequest = await request.json();

    const serviceResponse = await postService.createPost(userId, channelId, content);
    if (!serviceResponse.errorDetail.success) {
        const errorDetail = serviceResponse.errorDetail;
        return NextResponse.json<RegisterPostApiResponse>(
            { errorDetail },
            { status: errorDetail.status },
        );
    }

    return NextResponse.json<RegisterPostApiResponse>(
        {
            post: {
                postId: serviceResponse.post!.postId,
                channelId: serviceResponse.post!.channelId,
                userId: serviceResponse.post!.userId,
                content: serviceResponse.post?.content,
                createdAt: serviceResponse.post!.createdAt,
                updatedAt: serviceResponse.post!.updatedAt,
                displayName: serviceResponse.post!.displayName,
                imgUrl: serviceResponse.post!.imgUrl,
            },
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
}
