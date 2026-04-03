import { AppPrismaClient } from "@/app/lib/init";
import { IPostService, PostServiceResponse, PostsServiceResponse } from "./IPostService";
import { IPostRepository } from "@/repositories/IPostRepository";
import { ErrorDetail } from "@/app/common/ErrorDetail";

export class PostService implements IPostService {
    constructor(
        private prisma: AppPrismaClient,
        private repository: IPostRepository,
    ) {}

    async getPosts(userId: string, channelId: string): Promise<PostsServiceResponse> {
        return await this.repository.getPosts(userId, channelId);
    }

    async createPost(
        userId: string,
        channelId: string,
        content: string,
    ): Promise<PostServiceResponse> {
        try {
            return this.prisma.$transaction(
                async (tx) => await this.repository.createPost(tx, userId, channelId, content),
            );
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }

    async updatePost(postId: string, content: string): Promise<PostServiceResponse> {
        try {
            return this.prisma.$transaction(
                async (tx) => await this.repository.updatePost(tx, postId, content),
            );
        } catch (error) {
            return {
                errorDetail: ErrorDetail.getFromPrismaError(error),
            };
        }
    }

    async deletePost(postId: string): Promise<PostServiceResponse> {
        return await this.repository.deletePost(postId);
    }
}
