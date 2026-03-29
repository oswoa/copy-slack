import { ErrorDetail } from "@/app/common/ErrorDetail";
import { PostRecord } from "@/infrustructures/IPostDatabase";

export type PostServiceResponse = {
    post?: PostRecord;
    errorDetail: ErrorDetail;
};

export type PostsServiceResponse = {
    posts: PostRecord[];
    errorDetail: ErrorDetail;
};

export interface IPostService {
    getPosts(userId: string, channelId: string): Promise<PostsServiceResponse>;
    createPost(userId: string, channelId: string, content: string): Promise<PostServiceResponse>;
    updatePost(postId: string, content: string): Promise<PostServiceResponse>;
    deletePost(postId: string): Promise<PostServiceResponse>;
}
