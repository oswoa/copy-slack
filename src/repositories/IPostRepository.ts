import { ErrorDetail } from "@/app/common/ErrorDetail";
import { PostRecord } from "@/infrustructures/IPostDatabase";

export type PostRepositoryResponse = {
    posts: PostRecord[];
    errorDetail: ErrorDetail;
};

export interface IPostRepository {
    getPosts(userId: string, channelId: string): Promise<PostRepositoryResponse>;
}
