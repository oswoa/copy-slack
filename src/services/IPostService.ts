import { ErrorDetail } from "@/app/common/ErrorDetail";
import { PostRecord } from "@/infrustructures/IPostDatabase";

export type PostServiceResponse = {
    posts: PostRecord[];
    errorDetail: ErrorDetail;
};

export interface IPostService {
    getPosts(userId: string, channelId: string): Promise<PostServiceResponse>;
}
