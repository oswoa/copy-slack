import { NextResponse } from "next/server";

import { ErrorDetail } from "@/app/common/ErrorDetail";
import { PostRecord } from "@/infrastructures/post/IPostDatabase";
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
    const { postId } = await params;
    const { content }: UpdatePostApiRequest = await request.json();

    const serviceResponse = await postService.updatePost(postId, content);
    if (!serviceResponse.errorDetail.success) {
        return NextResponse.json<UpdatePostApiResponse>(
            { errorDetail: serviceResponse.errorDetail },
            { status: serviceResponse.errorDetail.status },
        );
    }

    return NextResponse.json<UpdatePostApiResponse>(
        {
            post: serviceResponse.post,
            errorDetail: serviceResponse.errorDetail,
        },
        { status: serviceResponse.errorDetail.status },
    );
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
