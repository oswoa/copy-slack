import { NextRequest, NextResponse } from "next/server";
import { ErrorDetail } from "@/app/common/ErrorDetail";
import { postService } from "@/app/lib/init";
import { PostRecord } from "@/infrustructures/IPostDatabase";
import { HttpStatusCode } from "axios";

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
    const { userId, channelId, content }: RegisterPostApiRequest = await request.json();

    const serviceResponse = await postService.createPost(userId, channelId, content);
    if (!serviceResponse.errorDetail.success) {
        const errorDetail = serviceResponse.errorDetail;
        return NextResponse.json({ errorDetail }, { status: errorDetail.status });
    }

    const apiResponse: RegisterPostApiResponse = {
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
    };

    return NextResponse.json(apiResponse, { status: apiResponse.errorDetail.status });
}
