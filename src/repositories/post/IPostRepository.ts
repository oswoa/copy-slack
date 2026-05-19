import { ErrorDetail } from "@/app/common/ErrorDetail";
import { TransactionClient } from "@/app/lib/init";
import { PostRecord } from "@/infrastructures/post/IPostDatabase";

export type PostRepositoryResponse = {
    post?: PostRecord;
    errorDetail: ErrorDetail;
};

export type PostsRepositoryResponse = {
    posts: PostRecord[];
    errorDetail: ErrorDetail;
};

export interface IPostRepository {
    getPosts(userId: string, channelId: string): Promise<PostsRepositoryResponse>;
    createPost(
        tx: TransactionClient,
        userId: string,
        channelId: string,
        content: string,
    ): Promise<PostRepositoryResponse>;
    updatePost(
        tx: TransactionClient,
        postId: string,
        content: string,
    ): Promise<PostRepositoryResponse>;
    deletePost(postId: string): Promise<PostRepositoryResponse>;
}
