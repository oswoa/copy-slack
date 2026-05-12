import { Prisma } from "@prisma/client";
import {
    IPostRepository,
    PostRepositoryResponse,
    PostsRepositoryResponse,
} from "./IPostRepository";
import { IPostDatabase, PostDatabaseResponse } from "@/infrastructures/post/IPostDatabase";
import { TransactionClient } from "@/app/lib/init";

export class PostRepository implements IPostRepository {
    constructor(private db: IPostDatabase) {}

    async getPosts(userId: string, channelId: string): Promise<PostsRepositoryResponse> {
        return await this.db.findAllById(userId, channelId);
    }

    async createPost(
        tx: TransactionClient,
        userId: string,
        channelId: string,
        content: string,
    ): Promise<PostDatabaseResponse> {
        return await this.db.create(tx, userId, channelId, content);
    }

    async updatePost(
        tx: TransactionClient,
        postId: string,
        content: string,
    ): Promise<PostRepositoryResponse> {
        return await this.db.patch(tx, postId, content);
    }

    async deletePost(postId: string): Promise<PostRepositoryResponse> {
        return await this.db.delete(postId);
    }
}
