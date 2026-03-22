import { IPostService, PostServiceResponse } from "./IPostService";
import { IPostRepository } from "@/repositories/IPostRepository";

export class PostService implements IPostService {
    constructor(private repository: IPostRepository) {}

    async getPosts(userId: string, channelId: string): Promise<PostServiceResponse> {
        return await this.repository.getPosts(userId, channelId);
    }
}
