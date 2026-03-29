import { Prisma } from "@prisma/client";
import {
    IPostRepository,
    PostRepositoryResponse,
    PostsRepositoryResponse,
} from "./IPostRepository";
import { IPostDatabase, PostDatabaseResponse } from "@/infrustructures/IPostDatabase";

export class PostRepository implements IPostRepository {
    constructor(private db: IPostDatabase) {}

    async getPosts(userId: string, channelId: string): Promise<PostsRepositoryResponse> {
        return await this.db.findAllById(userId, channelId);
    }

    async createPost(
        userId: string,
        channelId: string,
        content: string,
    ): Promise<PostDatabaseResponse> {
        return await this.db.create(userId, channelId, content);
    }

    async deletePost(postId: string): Promise<PostRepositoryResponse> {
        return await this.db.delete(postId);
    }
}
