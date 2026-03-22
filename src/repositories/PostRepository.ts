import { IPostRepository, PostRepositoryResponse } from "./IPostRepository";
import { IPostDatabase } from "@/infrustructures/IPostDatabase";

export class PostRepository implements IPostRepository {
    constructor(private db: IPostDatabase) {}

    async getPosts(userId: string, channelId: string): Promise<PostRepositoryResponse> {
        return await this.db.findAllById(userId, channelId);
    }
}
