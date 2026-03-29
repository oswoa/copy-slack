import { IPostService, PostServiceResponse, PostsServiceResponse } from "./IPostService";
import { IPostRepository } from "@/repositories/IPostRepository";

export class PostService implements IPostService {
    constructor(private repository: IPostRepository) {}

    async getPosts(userId: string, channelId: string): Promise<PostsServiceResponse> {
        return await this.repository.getPosts(userId, channelId);
    }

    async createPost(
        userId: string,
        channelId: string,
        content: string,
    ): Promise<PostServiceResponse> {
        return await this.repository.createPost(userId, channelId, content);
    }

    async deletePost(postId: string): Promise<PostServiceResponse> {
        return await this.repository.deletePost(postId);
    }
}
