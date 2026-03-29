import { ErrorDetail } from "@/app/common/ErrorDetail";
import { PostRecord } from "@/infrustructures/IPostDatabase";
import { PostServiceResponse } from "@/services/IPostService";

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
    updatePost(postId: string, content: string): Promise<PostRepositoryResponse>;
    deletePost(postId: string): Promise<PostRepositoryResponse>;
}
