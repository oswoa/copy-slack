import { ErrorDetail } from "@/app/common/ErrorDetail";
import { PostRecord } from "@/infrustructures/IPostDatabase";

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
    createPost(userId: string, channelId: string, content: string): Promise<PostRepositoryResponse>;
}
